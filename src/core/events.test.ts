import { describe, it, expect } from 'vitest';
import { eventMatches, type SimEvent } from './events';
import type { EventPattern } from './events';

describe('eventMatches', () => {
  it('จับคู่ type เดียวกัน', () => {
    const e: SimEvent = { type: 'app:open', app: 'safari' };
    const p: EventPattern = { type: 'app:open', app: 'safari' };
    expect(eventMatches(e, p)).toBe(true);
  });

  it('ไม่จับคู่ type ต่างกัน', () => {
    const e: SimEvent = { type: 'app:open', app: 'safari' };
    const p: EventPattern = { type: 'app:quit', app: 'safari' };
    expect(eventMatches(e, p)).toBe(false);
  });

  it('pattern ที่ระบุ field ต้องตรงทุก field', () => {
    const e: SimEvent = { type: 'app:open', app: 'notes' };
    expect(eventMatches(e, { type: 'app:open', app: 'notes' })).toBe(true);
    expect(eventMatches(e, { type: 'app:open', app: 'safari' })).toBe(false);
  });

  it('pattern ที่ไม่ระบุ field = รับทุกค่า', () => {
    const e: SimEvent = { type: 'settings:appearance', mode: 'dark' };
    expect(eventMatches(e, { type: 'settings:appearance' })).toBe(true);
  });

  it('จับคู่ shortcut ตาม key ที่กด', () => {
    const e: SimEvent = { type: 'shortcut', keys: 'cmd+space' };
    expect(eventMatches(e, { type: 'shortcut', keys: 'cmd+space' })).toBe(true);
    expect(eventMatches(e, { type: 'shortcut', keys: 'cmd+tab' })).toBe(false);
  });
});
