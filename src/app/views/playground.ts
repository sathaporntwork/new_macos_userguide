/** หน้าสนามซ้อม — เล่น simulator อิสระ พร้อมคีย์ลัดช่วยมือ + แผ่นสรุป */

import { h } from '../../core/dom';
import { Simulator } from '../../sim/simulator';
import { prettyKeys } from '../../core/utils';

const QUICK_KEYS: { keys: string; label: string }[] = [
  { keys: 'cmd+space', label: 'Spotlight' },
  { keys: 'cmd+up', label: 'Mission Control' },
  { keys: 'cmd+tab', label: 'สลับแอป' },
  { keys: 'cmd+w', label: 'ปิดหน้าต่าง' },
  { keys: 'cmd+m', label: 'ย่อหน้าต่าง' },
  { keys: 'cmd+q', label: 'ออกโปรแกรม' },
  { keys: 'cmd+c', label: 'คัดลอก' },
  { keys: 'cmd+v', label: 'วาง' },
  { keys: 'cmd+,', label: 'การตั้งค่า' },
  { keys: 'cmd+shift+3', label: 'ภาพหน้าจอ' },
];

export function renderPlayground(container: HTMLElement): { destroy(): void } {
  container.innerHTML = '';

  const bar = h(
    'div.pg-bar',
    h('div.pg-title', h('b', { text: '🏞️ สนามซ้อม' }), h('span', { text: 'เล่นได้อิสระ ไม่มีบทเรียน ไม่มีตัวตัดสิน — กด ⌘Space หรือปุ่มด้านล่างได้เลย' })),
    h(
      'div.pg-keys',
      ...QUICK_KEYS.map((k) =>
        h('button.pg-key', { onclick: () => sim.performShortcut(k.keys) }, h('kbd', { text: prettyKeys(k.keys) }), h('span', { text: k.label })),
      ),
    ),
  );

  const simHost = h('div.pg-simhost');
  container.append(h('div.playground', bar, simHost));

  const sim = new Simulator(simHost, { playground: true });
  sim.openApp('finder');

  return {
    destroy() {
      sim.destroy();
    },
  };
}
