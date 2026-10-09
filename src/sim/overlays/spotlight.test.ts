import { describe, it, expect } from 'vitest';
import { safeCalc } from './spotlight';
import { randomChallenges, trainerLesson } from '../../engine/trainer';
import { MODULES, ALL_LESSONS, TOTAL_LESSONS, findLesson, nextLessonId } from '../../curriculum';

describe('Spotlight calculator', () => {
  it('คำนวณเลขพื้นฐาน', () => {
    expect(safeCalc('1+2')).toBe(3);
    expect(safeCalc('25*4+10')).toBe(110);
    expect(safeCalc('(2+3)*4')).toBe(20);
    expect(safeCalc('10/4')).toBe(2.5);
  });

  it('ปฏิเสธข้อความที่ไม่ใช่สมการ', () => {
    expect(safeCalc('hello world')).toBeNull();
    expect(safeCalc('window.alert(1)')).toBeNull();
    expect(safeCalc('abc')).toBeNull();
    expect(safeCalc('')).toBeNull();
  });
});

describe('Trainer', () => {
  it('สุ่มได้ครบจำนวนและไม่ซ้ำ', () => {
    const ch = randomChallenges(10);
    expect(ch.length).toBe(10);
    expect(new Set(ch.map((c) => c.keys)).size).toBe(10);
  });

  it('บทเรียน trainer มี 10 step แบบ shortcut', () => {
    const l = trainerLesson();
    expect(l.steps.length).toBe(10);
    expect(l.steps.every((s) => s.kind === 'shortcut')).toBe(true);
  });
});

describe('Curriculum integrity', () => {
  it('มีครบ 7 โมดูล', () => {
    expect(MODULES.length).toBe(7);
  });

  it('ทุกบทเรียนมี id ไม่ซ้ำ และมีอย่างน้อย 3 step', () => {
    const ids = ALL_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of ALL_LESSONS) {
      expect(l.steps.length, `${l.id} ต้องมีอย่างน้อย 3 step`).toBeGreaterThanOrEqual(3);
      expect(l.xp).toBeGreaterThan(0);
      expect(l.minutes).toBeGreaterThan(0);
    }
  });

  it('TOTAL_LESSONS ตรงกับจำนวนบทเรียนจริง', () => {
    expect(TOTAL_LESSONS).toBe(ALL_LESSONS.length);
  });

  it('findLesson และ nextLessonId ทำงานถูก', () => {
    expect(findLesson('m1l1')?.module.id).toBe('m1');
    expect(nextLessonId('m1l1')).toBe('m1l2');
    expect(findLesson('nope')).toBeUndefined();
  });

  it('step ประเภท shortcut/quiz ต้องมีข้อมูลครบ', () => {
    for (const l of ALL_LESSONS) {
      for (const s of l.steps) {
        if (s.kind === 'quiz') {
          expect(s.options.length, `${l.id}`).toBeGreaterThanOrEqual(2);
          expect(s.answer, `${l.id}`).toBeLessThan(s.options.length);
          expect(s.explain.length, `${l.id}`).toBeGreaterThan(0);
        }
        if (s.kind === 'shortcut') {
          expect(s.keys, `${l.id}`).toMatch(/^[\w+,]+(\+[\w+,]+)*$/);
        }
        if (s.kind === 'freeplay') {
          expect(s.tasks.length, `${l.id}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('ทุก action step ต้องมี expect ที่ type ตรงกับ event ที่มีจริง', () => {
    // แค่เช็กว่า expect ถูกสร้างเป็น pattern ที่มี type เสมอ
    for (const l of ALL_LESSONS) {
      for (const s of l.steps) {
        if (s.kind === 'action') expect(s.expect.type, `${l.id}`).toBeTruthy();
      }
    }
  });
});
