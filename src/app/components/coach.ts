/** Coach panel — การ์ดคำสั่งลอยที่แนะนำทีละขั้น พร้อม highlight จุดเป้าหมายใน simulator */

import { h, clear, appendAll } from '../../core/dom';
import { prettyKeys } from '../../core/utils';
import type { Step } from '../../curriculum/types';
import type { Simulator } from '../../sim/simulator';

export interface CoachCallbacks {
  onNext(): void;
  onSkip(): void;
  onHintRequest(): void;
  onQuizAnswer(idx: number): boolean;
}

export class Coach {
  el: HTMLElement;
  private stepNumEl!: HTMLElement;
  private dotsEl!: HTMLElement;
  private bodyEl!: HTMLElement;
  private successEl!: HTMLElement;
  private missEl!: HTMLElement;
  private currentStep: Step | null = null;
  private sim: Simulator | null = null;
  private currentTarget: string | null = null;
  private ringEl: HTMLElement | null = null;
  private rafId: number | null = null;

  constructor(
    lessonTitle: string,
    private total: number,
    private cb: CoachCallbacks,
  ) {
    this.el = h(
      'aside.coach',
      h('div.coach-head', h('div.coach-lesson', { text: lessonTitle }), h('div.coach-stepnum', { text: 'เริ่มกันเลย' })),
      (this.dotsEl = h('div.coach-dots')),
      (this.bodyEl = h('div.coach-body')),
      h(
        'div.coach-foot',
        h('button.coach-btn ghost', { text: 'ขอคำใบ้', onclick: () => cb.onHintRequest() }),
        h('button.coach-btn ghost', { text: 'ข้ามขั้นนี้ ›', onclick: () => cb.onSkip() }),
      ),
    );
    this.stepNumEl = this.el.querySelector('.coach-stepnum') as HTMLElement;
    this.successEl = h('div.coach-success', { text: '✓ ถูกต้อง!' });
    this.missEl = h('div.coach-hintbox', {});
  }

  setStep(index: number, step: Step): void {
    this.currentStep = step;
    this.stepNumEl.textContent = `ขั้นที่ ${index + 1}/${this.total}`;
    clear(this.dotsEl);
    for (let i = 0; i < this.total; i++) {
      this.dotsEl.appendChild(h('span.dot', { class: i < index ? 'done' : i === index ? 'now' : '' }));
    }
    clear(this.bodyEl);
    this.el.classList.remove('flash-success');

    switch (step.kind) {
      case 'info':
        appendAll(
          this.bodyEl,
          h('h3.coach-title', { text: step.title }),
          h('p.coach-text', { html: step.body }),
          step.winTip ? this.winTipBox(step.winTip) : null,
          h('button.coach-btn primary', { text: 'เข้าใจแล้ว ไปต่อ ›', onclick: () => this.cb.onNext() }),
        );
        break;

      case 'action':
        appendAll(
          this.bodyEl,
          h('div.coach-badge', { text: '🎯 ลงมือทำ' }),
          h('h3.coach-instruction', { text: step.instruction }),
          step.winTip ? this.winTipBox(step.winTip) : null,
          h('div.coach-hintslot'),
        );
        break;

      case 'shortcut':
        appendAll(
          this.bodyEl,
          h('div.coach-badge', { text: '⌨️ กดคีย์ลัด' }),
          h('h3.coach-instruction', { text: step.instruction }),
          h(
            'div.coach-keys',
            h(
              'button.keycap-btn',
              {
                title: 'กดปุ่มนี้เพื่อจำลองการพิมพ์คีย์ลัดนี้',
                onclick: () => this.pressKeys(step.keys),
              },
              ...step.keys.split('+').map((k) => h('kbd.keycap', { text: prettyKeys(k) })),
            ),
          ),
          h('p.coach-small', { text: 'ใช้คีย์บอร์ดจริงได้เลย (ปุ่ม Ctrl ของคุณ = ⌘) หรือกดปุ่มด้านบน' }),
          step.winTip ? this.winTipBox(step.winTip) : null,
          h('div.coach-hintslot'),
        );
        break;

      case 'quiz': {
        appendAll(this.bodyEl, h('div.coach-badge', { text: '❓ คำถามท้ายขั้น' }), h('h3.coach-instruction', { text: step.question }));
        const optsEl = h('div.coach-quiz');
        step.options.forEach((opt, i) => {
          optsEl.appendChild(
            h(
              'button.quiz-opt',
              {
                onclick: (e: Event) => {
                  const correct = this.cb.onQuizAnswer(i);
                  const btn = e.currentTarget as HTMLButtonElement;
                  if (correct) {
                    btn.classList.add('correct');
                    optsEl.querySelectorAll('.quiz-opt').forEach((b) => ((b as HTMLButtonElement).disabled = true));
                    setTimeout(() => this.cb.onNext(), 1600);
                  } else {
                    btn.classList.add('wrong');
                    btn.disabled = true;
                    this.bodyEl.querySelector('.quiz-explain')?.remove();
                    appendAll(this.bodyEl, h('p.quiz-explain', { text: step.explain }));
                  }
                },
              },
              h('span.quiz-letter', { text: String.fromCharCode(65 + i) }),
              opt,
            ),
          );
        });
        this.bodyEl.appendChild(optsEl);
        break;
      }

      case 'freeplay':
        appendAll(
          this.bodyEl,
          h('div.coach-badge', { text: '🏅 ภารกิจอิสระ' }),
          h('h3.coach-instruction', { text: step.instruction }),
          h(
            'ul.freeplay-list',
            ...step.tasks.map((t, i) =>
              h('li.freeplay-task', { dataset: { taskIndex: String(i) } }, h('span.fp-check', { text: '○' }), t.label),
            ),
          ),
          h('p.coach-small', { text: 'ทำจนเช็กครบทุกข้อ — ระบบตรวจให้อัตโนมัติ' }),
        );
        break;
    }
  }

  private winTipBox(tip: string): HTMLElement {
    return h('div.coach-wintip', h('b', { text: '🪟 เทียบกับ Windows: ' }), tip);
  }

  private pressKeys(keys: string): void {
    this.sim?.performShortcut(keys);
  }

  bindSim(sim: Simulator): void {
    this.sim = sim;
  }

  showHint(hint: string): void {
    const slot = this.bodyEl.querySelector<HTMLElement>('.coach-hintslot');
    if (!slot) return;
    clear(slot);
    clear(this.missEl);
    appendAll(this.missEl, h('b', { text: '💡 คำใบ้: ' }), hint);
    slot.appendChild(this.missEl);
    this.missEl.classList.add('show');
  }

  freeplayProgress(done: number, doneIdx: number[]): void {
    this.el.querySelectorAll('.freeplay-task').forEach((el) => {
      const i = Number((el as HTMLElement).dataset.taskIndex);
      const isDone = doneIdx.includes(i);
      el.classList.toggle('done', isDone);
      const check = el.querySelector('.fp-check');
      if (check) check.textContent = isDone ? '✓' : '○';
    });
    void done;
  }

  success(): void {
    this.el.classList.add('flash-success');
    clear(this.bodyEl);
    this.bodyEl.appendChild(this.successEl);
  }

  /** เน้นจุดเป้าหมายใน simulator ด้วยวงแหวนเต้น ๆ */
  highlight(sim: Simulator, target?: string): void {
    this.clearHighlight();
    if (!target) return;
    this.currentTarget = target;
    const ring = h('div.coach-ring');
    sim.root.appendChild(ring);
    this.ringEl = ring;
    const tick = () => {
      if (this.currentTarget !== target) return;
      const el = sim.root.querySelector(`[data-sim-target="${target}"]`) as HTMLElement | null;
      if (el) {
        const rootRect = sim.root.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        Object.assign(ring.style, {
          display: 'block',
          left: `${r.left - rootRect.left - 5}px`,
          top: `${r.top - rootRect.top - 5}px`,
          width: `${r.width + 10}px`,
          height: `${r.height + 10}px`,
        });
      } else {
        ring.style.display = 'none';
      }
      this.rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  clearHighlight(): void {
    this.currentTarget = null;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.ringEl?.remove();
    this.ringEl = null;
  }

  get step(): Step | null {
    return this.currentStep;
  }
}
