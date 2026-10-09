/** หน้าบทเรียน — simulator + coach panel + tutor engine */

import { h } from '../../core/dom';
import { Simulator } from '../../sim/simulator';
import { Tutor } from '../../engine/tutor';
import { completeLesson, awardBadge, loadProgress, setTrainerBest } from '../../engine/progress';
import { TRAINER_BADGE } from '../../engine/trainer';
import { findLesson, nextLessonId, moduleComplete, MODULES } from '../../curriculum';
import type { Lesson, Module, Step } from '../../curriculum/types';
import { navigate } from '../router';
import { Coach } from '../components/coach';

export interface LessonViewHandle {
  destroy(): void;
}

export function renderLessonView(container: HTMLElement, lessonId: string, trainer: Lesson | null = null): LessonViewHandle | null {
  const found = trainer ? undefined : findLesson(lessonId);
  if (!found && !trainer) {
    navigate('/');
    return null;
  }
  const lesson: Lesson = trainer ?? found!.lesson;
  const mod: Module | null = trainer ? null : found!.module;
  const isTrainer = Boolean(trainer);

  container.innerHTML = '';
  const simHost = h('div.lesson-simhost');
  const page = h(
    'div.lesson-page',
    h(
      'div.lesson-topbar',
      h('a.back', { href: isTrainer ? '#/' : `#/module/${mod?.id ?? ''}`, html: '‹ กลับ' }),
      h('div.lesson-top-title', { text: `${mod ? `โมดูล ${mod.number}: ` : ''}${lesson.title}` }),
      h('div.lesson-top-meta', h('span', { text: `⏱ ${lesson.minutes} นาที` }), h('span', { text: `+${lesson.xp} XP` })),
      h('button.restart', { text: '↺ เริ่มใหม่', onclick: () => location.reload() }),
    ),
    h('div.lesson-main', simHost),
  );
  container.appendChild(page);

  const sim = new Simulator(simHost, { initial: lesson.initial });
  let skipped = 0;
  const coach = new Coach(lesson.title, lesson.steps.length, {
    onNext: () => tutor.advance(),
    onSkip: () => {
      if (isTrainer) skipped++;
      tutor.skip();
    },
    onHintRequest: () => {
      const s = coach.step;
      if (s && 'hint' in s && s.hint) coach.showHint(s.hint);
    },
    onQuizAnswer: (idx) => tutor.answerQuiz(idx),
  });
  coach.bindSim(sim);

  const main = page.querySelector('.lesson-main')!;
  main.appendChild(coach.el);

  const tutor = new Tutor(lesson, {
    onStep(index: number, step: Step) {
      coach.setStep(index, step);
      coach.highlight(sim, step.kind === 'action' ? step.target : undefined);
    },
    onSuccess() {
      coach.success();
      coach.clearHighlight();
    },
    onMiss(step) {
      if ('hint' in step && step.hint) coach.showHint(step.hint);
      else if (step.kind === 'shortcut') coach.showHint('กดปุ่มคีย์ลัดในการ์ดด้านขวา หรือใช้คีย์บอร์ดจริง');
      else coach.showHint('ลองอ่านคำสั่งอีกครั้ง แล้วสังเกตวงแหวนที่เน้นไว้ในหน้าจอ Mac');
    },
    onFreeplayProgress(done, _total, doneIdx) {
      coach.freeplayProgress(done, doneIdx);
    },
    onComplete() {
      if (isTrainer) finishTrainer();
      else finishLesson();
    },
  });

  function finishLesson(): void {
    const prevXp = loadProgress().xp;
    completeLesson(lesson.id, lesson.xp);
    const newBadges: string[] = [];

    if (awardBadge({ id: 'badge:first', name: 'ก้าวแรกบนโลก Mac', emoji: '👣', desc: 'จบบทเรียนแรกสำเร็จ' })) {
      newBadges.push('👣 ก้าวแรกบนโลก Mac');
    }
    if (mod && moduleComplete(mod)) {
      if (awardBadge(mod.badge)) newBadges.push(`${mod.badge.emoji} ${mod.badge.name}`);
      if (mod.id === 'm7' && MODULES.every((m) => moduleComplete(m))) {
        if (awardBadge({ id: 'badge:pro', name: 'Mac Pro User', emoji: '🏆', desc: 'จบครบทั้ง 7 โมดูล' })) {
          newBadges.push('🏆 Mac Pro User');
        }
      }
    }
    const gained = loadProgress().xp - prevXp;
    showComplete(gained, newBadges);
  }

  function finishTrainer(): void {
    const total = lesson.steps.length;
    const score = total - skipped;
    if (score >= 8 && awardBadge(TRAINER_BADGE)) void score;
    setTrainerBest(score);
    showTrainerResult(score, total);
  }

  function showComplete(gainedXp: number, badges: string[]): void {
    const next = nextLessonId(lesson.id);
    page.appendChild(
      h(
        'div.lesson-done',
        h(
          'div.done-card',
          h('div.done-emoji', { text: '🎉' }),
          h('h2', { text: 'จบบทเรียนแล้ว!' }),
          h('p.done-xp', { text: `ได้รับ +${gainedXp} XP` }),
          badges.length ? h('p.done-badges', { text: `ตราใหม่: ${badges.join(' • ')}` }) : null,
          h(
            'div.done-btns',
            next ? h('button.coach-btn primary', { text: 'บทถัดไป ›', onclick: () => navigate(`/lesson/${next}`) }) : null,
            mod
              ? h('button.coach-btn ghost', { text: 'กลับไปหน้าโมดูล', onclick: () => navigate(`/module/${mod.id}`) })
              : h('button.coach-btn ghost', { text: 'กลับหน้าแรก', onclick: () => navigate('/') }),
          ),
        ),
      ),
    );
  }

  function showTrainerResult(score: number, total: number): void {
    page.appendChild(
      h(
        'div.lesson-done',
        h(
          'div.done-card',
          h('div.done-emoji', { text: score >= 8 ? '🎯' : '💪' }),
          h('h2', { text: `คะแนน: ${score}/${total}` }),
          h('p.done-xp', {
            text: score >= 8 ? 'เยี่ยมมาก! คุณได้ตรา "นักฆ่าคีย์ลัด" 🎯' : 'ผ่านด่านแรกแล้ว ลองอีกรอบให้ได้ 8+ เพื่อรับตรา!',
          }),
          h(
            'div.done-btns',
            h('button.coach-btn primary', { text: '↺ สุ่มโจทย์ใหม่', onclick: () => location.reload() }),
            h('button.coach-btn ghost', { text: 'กลับหน้าแรก', onclick: () => navigate('/') }),
          ),
        ),
      ),
    );
  }

  tutor.start();

  return {
    destroy() {
      tutor.destroy();
      coach.clearHighlight();
      sim.destroy();
    },
  };
}
