/** ประเภทข้อมูลของหลักสูตร — โมดูล, บทเรียน, step */

import type { EventPattern } from '../core/events';
import type { SimState } from '../sim/state';

export type Step =
  | {
      kind: 'info';
      title: string;
      body: string;
      /** เกร็ดเทียบกับ Windows */
      winTip?: string;
    }
  | {
      kind: 'action';
      instruction: string;
      /** data-sim-target ที่ต้องเน้น เช่น 'dock:finder' */
      target?: string;
      expect: EventPattern;
      hint?: string;
      winTip?: string;
    }
  | {
      kind: 'shortcut';
      instruction: string;
      /** คีย์ลัดมาตรฐาน เช่น 'cmd+space' */
      keys: string;
      hint?: string;
      winTip?: string;
    }
  | {
      kind: 'quiz';
      question: string;
      options: string[];
      /** index ของคำตอบที่ถูก */
      answer: number;
      explain: string;
    }
  | {
      kind: 'freeplay';
      instruction: string;
      tasks: { label: string; expect: EventPattern }[];
    };

export interface Lesson {
  id: string;
  title: string;
  goal: string;
  minutes: number;
  xp: number;
  /** สถานะเริ่มต้นของ simulator เมื่อเปิดบทเรียนนี้ */
  initial?: Partial<SimState>;
  steps: Step[];
}

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
}

export interface Module {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge: BadgeDef;
  lessons: Lesson[];
}
