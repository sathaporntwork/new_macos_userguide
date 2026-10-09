import { describe, it, expect, beforeEach } from 'vitest';
import {
  emptyProgress,
  loadProgress,
  saveProgress,
  completeLesson,
  awardBadge,
  levelInfo,
  addXp,
  resetProgress,
} from './progress';
import type { BadgeDef } from '../curriculum/types';

// stub localStorage สำหรับ environment node
const store = new Map<string, string>();
const g = globalThis as unknown as { localStorage?: Storage };
g.localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() {
    return store.size;
  },
} as Storage;

beforeEach(() => resetProgress());

describe('progress', () => {
  it('ค่าเริ่มต้น = ศูนย์', () => {
    expect(loadProgress()).toEqual(emptyProgress());
  });

  it('บันทึก/โหลดได้', () => {
    saveProgress({ xp: 42, lessons: {}, badges: ['badge:m1'], trainerBest: 7 });
    expect(loadProgress().xp).toBe(42);
    expect(loadProgress().badges).toContain('badge:m1');
  });

  it('completeLesson เพิ่ม XP ครั้งเดียวต่อบท', () => {
    completeLesson('m1l1', 50);
    completeLesson('m1l1', 50);
    const p = loadProgress();
    expect(p.xp).toBe(50);
    expect(p.lessons['m1l1']?.completed).toBe(true);
  });

  it('awardBadge ให้โบนัส 50 XP ครั้งเดียว', () => {
    const badge: BadgeDef = { id: 'badge:m2', name: 'x', emoji: '🎯', desc: '' };
    expect(awardBadge(badge)).toBe(true);
    expect(awardBadge(badge)).toBe(false);
    expect(loadProgress().xp).toBe(50);
  });

  it('levelInfo คำนวณระดับและ progress ถูกต้อง', () => {
    expect(levelInfo(0).name).toBe('New User');
    expect(levelInfo(150).name).toBe('Explorer');
    expect(levelInfo(100).progress).toBeCloseTo(100 / 150);
    expect(levelInfo(99999).isMax).toBe(true);
    expect(levelInfo(99999).name).toBe('Pro User');
  });

  it('addXp สะสมได้', () => {
    addXp(10);
    addXp(15);
    expect(loadProgress().xp).toBe(25);
  });
});
