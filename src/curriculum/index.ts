/** ทะเบียนหลักสูตรทั้งหมด */

import type { Lesson, Module } from './types';
import { module1 } from './module1';
import { module2 } from './module2';
import { module3 } from './module3';
import { module4 } from './module4';
import { module5 } from './module5';
import { module6 } from './module6';
import { module7 } from './module7';

export const MODULES: Module[] = [module1, module2, module3, module4, module5, module6, module7];

export const ALL_LESSONS: Lesson[] = MODULES.flatMap((m) => m.lessons);

export const TOTAL_LESSONS = ALL_LESSONS.length;

export const TOTAL_MINUTES = ALL_LESSONS.reduce((sum, l) => sum + l.minutes, 0);

export const TOTAL_XP = ALL_LESSONS.reduce((sum, l) => sum + l.xp, 0);

export function findModule(moduleId: string): Module | undefined {
  return MODULES.find((m) => m.id === moduleId);
}

export function findLesson(lessonId: string): { module: Module; lesson: Lesson; index: number } | undefined {
  for (const m of MODULES) {
    const index = m.lessons.findIndex((l) => l.id === lessonId);
    if (index !== -1) return { module: m, lesson: m.lessons[index]!, index };
  }
  return undefined;
}

export function nextLessonId(lessonId: string): string | null {
  const idx = ALL_LESSONS.findIndex((l) => l.id === lessonId);
  if (idx === -1 || idx === ALL_LESSONS.length - 1) return null;
  return ALL_LESSONS[idx + 1]?.id ?? null;
}

export function moduleComplete(m: Module): boolean {
  return m.lessons.every((l) => Boolean(lessonDone(l.id)));
}

let doneCheck: (id: string) => boolean = () => false;
/** ผูกฟังก์ชันเช็กสถานะบทเรียน (เรียกจาก main.ts หลีกเลี่ยง dependency วน) */
export function registerDoneCheck(fn: (id: string) => boolean): void {
  doneCheck = fn;
}

export function lessonDone(id: string): boolean {
  return doneCheck(id);
}
