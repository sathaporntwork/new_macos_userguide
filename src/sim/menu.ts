/** เมนูป๊อปอัปกลาง — ใช้ทั้งเมนูบาร์, คลิกขวาใน Finder และเดสก์ท็อป */

import { h } from '../core/dom';
import type { Simulator } from './simulator';

export interface MenuItem {
  label?: string;
  shortcut?: string;
  separator?: boolean;
  disabled?: boolean;
  danger?: boolean;
  checked?: boolean;
  onclick?: () => void;
}

/** เปิดเมนูที่ตำแหน่ง (พิกัดสัมพัทธ์กับ sim root) ปิดเมนูเดิมก่อน */
export function openMenu(sim: Simulator, items: MenuItem[], x: number, y: number, anchorClass = ''): HTMLElement {
  closeMenus(sim);
  const menu = h(
    'div.sim-menu ' + anchorClass,
    { role: 'menu' },
    ...items.map((item) =>
      item.separator
        ? h('div.menu-sep')
        : h(
            'div.menu-item',
            {
              class: `${item.disabled ? 'disabled' : ''} ${item.danger ? 'danger' : ''}`.trim(),
              role: 'menuitem',
              onclick: () => {
                if (item.disabled) return;
                closeMenus(sim);
                item.onclick?.();
              },
            },
            h('span.menu-check', { text: item.checked ? '✓' : '' }),
            h('span.menu-label', { text: item.label ?? '' }),
            item.shortcut ? h('span.menu-shortcut', { text: item.shortcut }) : null,
          ),
    ),
  );
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  sim.overlayLayer.appendChild(menu);

  // กันเมนูล้นขอบ
  requestAnimationFrame(() => {
    const root = sim.root.getBoundingClientRect();
    const r = menu.getBoundingClientRect();
    if (r.right > root.width - 8) menu.style.left = `${Math.max(8, x - (r.right - root.width) - 8)}px`;
    if (r.bottom > root.height - 8) menu.style.top = `${Math.max(32, y - r.height - (y > 40 ? 30 : 4))}px`;
  });

  const closer = (e: PointerEvent) => {
    if (!menu.contains(e.target as Node)) closeMenus(sim);
  };
  setTimeout(() => document.addEventListener('pointerdown', closer, { capture: true }), 0);
  sim.menuCleanups.push(() => document.removeEventListener('pointerdown', closer, { capture: true }));
  return menu;
}

export function closeMenus(sim: Simulator): void {
  sim.menuCleanups.forEach((fn) => fn());
  sim.menuCleanups = [];
  sim.overlayLayer.querySelectorAll('.sim-menu, .sim-popover').forEach((el) => el.remove());
}
