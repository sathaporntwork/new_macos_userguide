/** Utility functions ที่ใช้ร่วมกันทั้งโปรเจกต์ */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** รอเวลา (ms) แบบ promise */
export function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** จัดรูปแบบตัวเลขเป็น percent */
export function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/** escape HTML สำหรับ terminal output */
export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** ปีกกา ⌘ และสัญลักษณ์คีย์ต่าง ๆ */
export const KEY_GLYPHS: Record<string, string> = {
  cmd: '⌘',
  ctrl: '⌃',
  alt: '⌥',
  shift: '⇧',
  tab: '⇥',
  space: 'Space',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  enter: '↩',
  esc: 'esc',
  delete: '⌫',
};

/** แปลง 'cmd+shift+4' เป็น '⌘⇧4' สำหรับแสดงผล */
export function prettyKeys(keys: string): string {
  return keys
    .split('+')
    .map((k) => KEY_GLYPHS[k] ?? k.toUpperCase())
    .join('');
}

/** ปกตินามคีย์จาก KeyboardEvent เป็นชื่อมาตรฐานของเรา */
export function normalizeKey(e: KeyboardEvent): string | null {
  const k = e.key.toLowerCase();
  if (k === 'meta' || k === 'control') return 'cmd';
  if (k === 'alt') return 'alt';
  if (k === 'shift') return 'shift';
  if (k === ' ') return 'space';
  if (k === 'escape') return 'esc';
  if (k === 'arrowup') return 'up';
  if (k === 'arrowdown') return 'down';
  if (k === 'arrowleft') return 'left';
  if (k === 'arrowright') return 'right';
  if (k === 'enter') return 'enter';
  if (k === 'backspace') return 'delete';
  if (k === 'tab') return 'tab';
  if (k.length === 1) return k;
  return k; // 'f3', 'home' ฯลฯ
}

/** วันที่ภาษาไทย */
export function thaiDate(d: Date): string {
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
}
