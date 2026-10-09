/** ระบบความคืบหน้า: XP, ระดับ, ตรา — เก็บใน localStorage */

import type { BadgeDef } from '../curriculum/types';

const KEY = 'macpath26:v1';

export interface LessonRecord {
  completed: boolean;
  date: string;
}

export interface ProgressData {
  xp: number;
  lessons: Record<string, LessonRecord>;
  badges: string[];
  trainerBest: number;
}

export const LEVELS: { xp: number; name: string; emoji: string }[] = [
  { xp: 0, name: 'New User', emoji: '🌱' },
  { xp: 150, name: 'Explorer', emoji: '🧭' },
  { xp: 400, name: 'Regular User', emoji: '🚶' },
  { xp: 800, name: 'Advanced', emoji: '⭐' },
  { xp: 1400, name: 'Pro User', emoji: '🏆' },
];

export function emptyProgress(): ProgressData {
  return { xp: 0, lessons: {}, badges: [], trainerBest: 0 };
}

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const data = JSON.parse(raw) as Partial<ProgressData>;
    return {
      xp: data.xp ?? 0,
      lessons: data.lessons ?? {},
      badges: data.badges ?? [],
      trainerBest: data.trainerBest ?? 0,
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(p: ProgressData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // โหมดส่วนตัว/พื้นที่เต็ม — ไม่ต้องทำอะไร ความคืบหน้าจะอยู่แค่ชั่วคราว
  }
}

export function addXp(amount: number): ProgressData {
  const p = loadProgress();
  p.xp += amount;
  saveProgress(p);
  return p;
}

export function completeLesson(lessonId: string, xp: number): ProgressData {
  const p = loadProgress();
  if (!p.lessons[lessonId]?.completed) {
    p.lessons[lessonId] = { completed: true, date: new Date().toISOString() };
    p.xp += xp;
    saveProgress(p);
  }
  return p;
}

export function markLessonIncomplete(lessonId: string): void {
  const p = loadProgress();
  delete p.lessons[lessonId];
  saveProgress(p);
}

export function awardBadge(badge: BadgeDef): boolean {
  const p = loadProgress();
  if (p.badges.includes(badge.id)) return false;
  p.badges.push(badge.id);
  p.xp += 50; // โบนัสตรา
  saveProgress(p);
  return true;
}

export function hasBadge(id: string): boolean {
  return loadProgress().badges.includes(id);
}

export function setTrainerBest(score: number): void {
  const p = loadProgress();
  if (score > p.trainerBest) {
    p.trainerBest = score;
    p.xp += 30;
    saveProgress(p);
  }
}

export function resetProgress(): void {
  saveProgress(emptyProgress());
}

export interface LevelInfo {
  index: number;
  name: string;
  emoji: string;
  current: number;
  next: number | null;
  /** 0-1 ความคืบหน้าสู่ระดับถัดไป */
  progress: number;
  isMax: boolean;
}

export function levelInfo(xp: number): LevelInfo {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i]!.xp) index = i;
  }
  const cur = LEVELS[index]!;
  const next = LEVELS[index + 1];
  if (!next) {
    return { index, name: cur.name, emoji: cur.emoji, current: cur.xp, next: null, progress: 1, isMax: true };
  }
  return {
    index,
    name: cur.name,
    emoji: cur.emoji,
    current: cur.xp,
    next: next.xp,
    progress: (xp - cur.xp) / (next.xp - cur.xp),
    isMax: false,
  };
}

/** สถิติรวม */
export function stats(totalLessons: number): { done: number; percent: number } & ProgressData {
  const p = loadProgress();
  const done = Object.values(p.lessons).filter((l) => l.completed).length;
  return { ...p, done, percent: totalLessons ? Math.round((done / totalLessons) * 100) : 0 };
}
