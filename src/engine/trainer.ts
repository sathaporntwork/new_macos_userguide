/** Shortcuts Trainer — โหมดฝึกคีย์ลัดจับเวลา สุ่มโจทย์ 10 ข้อ */

import type { Lesson, Step } from '../curriculum/types';

export interface TrainerChallenge {
  keys: string;
  prompt: string;
}

const CHALLENGES: TrainerChallenge[] = [
  { keys: 'cmd+space', prompt: 'เปิด Spotlight ค้นหา' },
  { keys: 'cmd+c', prompt: 'คัดลอก (Copy)' },
  { keys: 'cmd+v', prompt: 'วาง (Paste)' },
  { keys: 'cmd+w', prompt: 'ปิดหน้าต่างปัจจุบัน' },
  { keys: 'cmd+q', prompt: 'ออกจากโปรแกรมทั้งตัว' },
  { keys: 'cmd+m', prompt: 'ย่อหน้าต่างไปที่ Dock' },
  { keys: 'cmd+tab', prompt: 'สลับไปแอปถัดไป' },
  { keys: 'cmd+,', prompt: 'เปิดการตั้งค่า (Settings)' },
  { keys: 'cmd+up', prompt: 'เปิด Mission Control' },
  { keys: 'cmd+shift+3', prompt: 'ถ่ายภาพหน้าจอทั้งจอ' },
  { keys: 'esc', prompt: 'ยกเลิก / ปิด overlay' },
  { keys: 'cmd+left', prompt: 'สลับไป Desktop ก่อนหน้า' },
];

export function randomChallenges(count = 10): TrainerChallenge[] {
  const pool = [...CHALLENGES];
  const picked: TrainerChallenge[] = [];
  while (picked.length < count && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(i, 1)[0]!);
  }
  return picked;
}

/** สร้าง "บทเรียน" ของ trainer เพื่อใช้กับ Tutor engine ร่วมกับบทเรียนปกติ */
export function trainerLesson(): Lesson {
  const challenges = randomChallenges(10);
  const steps: Step[] = challenges.map((c) => ({
    kind: 'shortcut' as const,
    instruction: c.prompt,
    keys: c.keys,
    hint: 'กดปุ่มในการ์ดด้านล่าง หรือใช้คีย์บอร์ดจริง (Ctrl = ⌘)',
  }));
  return {
    id: 'trainer',
    title: 'สนามฝึกคีย์ลัด',
    goal: 'ตอบให้ได้มากที่สุดใน 10 ข้อ — ผิดไม่เสียอะไร กด "ข้าม" ได้',
    minutes: 4,
    xp: 50,
    steps,
  };
}

export const TRAINER_BADGE = { id: 'badge:trainer', name: 'นักฆ่าคีย์ลัด', emoji: '🎯', desc: 'ทำคะแนนสนามฝึกคีย์ลัดได้ 8/10 ขึ้นไป' };
