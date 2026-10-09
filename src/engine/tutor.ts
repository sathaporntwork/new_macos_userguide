/** Tutor engine — รันบทเรียนทีละ step ตรวจ event จาก simulator แล้วเลื่อนขั้นอัตโนมัติ */

import { bus, eventMatches, type SimEvent } from '../core/events';
import type { Lesson, Step } from '../curriculum/types';

export interface TutorCallbacks {
  /** แสดง step ใหม่ใน UI */
  onStep(index: number, step: Step): void;
  /** step ผ่านแล้ว (เอฟเฟกต์ความสำเร็จ) */
  onSuccess(index: number): void;
  /** ทำผิด 3 ครั้ง — แสดง hint อัตโนมัติ */
  onMiss(step: Step): void;
  /** freeplay: ทำสำเร็จ k จาก n งาน */
  onFreeplayProgress(done: number, total: number, doneIdx: number[]): void;
  /** จบบทเรียน */
  onComplete(): void;
}

export class Tutor {
  index = -1;
  missCount = 0;
  freeplayDone = new Set<number>();
  private unsub: (() => void) | null = null;
  private advanceTimer: number | null = null;
  private completed = false;

  constructor(
    public lesson: Lesson,
    private cb: TutorCallbacks,
  ) {
    this.unsub = bus.on((e) => this.handleEvent(e));
  }

  start(): void {
    this.enter(0);
  }

  get currentStep(): Step | undefined {
    return this.lesson.steps[this.index];
  }

  get total(): number {
    return this.lesson.steps.length;
  }

  private enter(i: number): void {
    this.index = i;
    this.missCount = 0;
    this.freeplayDone.clear();
    const step = this.lesson.steps[i];
    if (step) this.cb.onStep(i, step);
  }

  /** ไป step ถัดไป (ใช้กับ info / quiz ที่ผู้เรียนกดเอง) */
  advance(): void {
    if (this.completed) return;
    if (this.advanceTimer) {
      clearTimeout(this.advanceTimer);
      this.advanceTimer = null;
    }
    if (this.index >= this.lesson.steps.length - 1) {
      this.complete();
    } else {
      this.enter(this.index + 1);
    }
  }

  /** ข้าม step ปัจจุบัน */
  skip(): void {
    this.advance();
  }

  /** ตอบคำถาม quiz — คืน true ถ้าถูก */
  answerQuiz(choice: number): boolean {
    const step = this.lesson.steps[this.index];
    if (step?.kind !== 'quiz') return false;
    return choice === step.answer;
  }

  private handleEvent(e: SimEvent): void {
    if (this.completed || this.index < 0) return;
    const step = this.lesson.steps[this.index];
    if (!step) return;

    if (step.kind === 'action' || step.kind === 'shortcut') {
      const expect = step.kind === 'action' ? step.expect : { type: 'shortcut' as const, keys: step.keys };
      if (eventMatches(e, expect)) {
        this.success();
      } else {
        this.missCount++;
        if (this.missCount === 3) this.cb.onMiss(step);
      }
    } else if (step.kind === 'freeplay') {
      step.tasks.forEach((t, i) => {
        if (!this.freeplayDone.has(i) && eventMatches(e, t.expect)) {
          this.freeplayDone.add(i);
        }
      });
      this.cb.onFreeplayProgress(this.freeplayDone.size, step.tasks.length, [...this.freeplayDone]);
      if (this.freeplayDone.size === step.tasks.length) this.success();
    }
  }

  private success(): void {
    if (this.advanceTimer) return;
    this.cb.onSuccess(this.index);
    this.advanceTimer = window.setTimeout(() => {
      this.advanceTimer = null;
      this.advance();
    }, 750);
  }

  private complete(): void {
    if (this.completed) return;
    this.completed = true;
    this.cb.onComplete();
  }

  destroy(): void {
    this.unsub?.();
    this.unsub = null;
    if (this.advanceTimer) {
      clearTimeout(this.advanceTimer);
      this.advanceTimer = null;
    }
  }
}
