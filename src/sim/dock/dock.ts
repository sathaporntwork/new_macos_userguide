/** Dock — แถบแอปด้านล่าง พร้อม magnification, running indicator และถังขยะ */

import { h, clear } from '../../core/dom';
import { ICONS } from '../icons';
import { appDisplayName } from '../state';
import type { Simulator } from '../simulator';

const DOCK_ORDER = ['finder', 'launchpad', 'safari', 'mail', 'notes', 'photos', 'calendar', 'terminal', 'settings'];

export class Dock {
  el: HTMLElement;

  constructor(private sim: Simulator) {
    this.el = h('div.sim-dock', { dataset: { simTarget: 'dock' } });
    this.el.addEventListener('mousemove', (e) => this.magnify(e));
    this.el.addEventListener('mouseleave', () => this.reset());
    this.render();
  }

  render(): void {
    clear(this.el);
    const s = this.sim.store.get();

    for (const id of DOCK_ORDER) {
      const app = this.sim.apps[id];
      if (!app) continue;
      const running = s.runningApps.includes(id);
      this.el.appendChild(
        h(
          'button.dock-app',
          {
            dataset: { simTarget: `dock:${id}`, dockApp: id },
            title: appDisplayName(id),
            onclick: () => {
              if (id === 'launchpad') {
                this.sim.emit({ type: 'dock:click', app: id });
                this.sim.toggleLaunchpad();
                return;
              }
              this.sim.emit({ type: 'dock:click', app: id });
              this.sim.dockClickApp(id);
            },
          },
          h('div.dock-icon', { html: ICONS[app.icon] ?? '' }),
          h('span.dock-dot', { class: running ? 'on' : '' }),
          h('span.dock-tip', { text: appDisplayName(id) }),
        ),
      );
    }

    // เส้นแบ่ง + ถังขยะ
    this.el.appendChild(h('div.dock-sep'));
    const trashFull = s.trash.length > 0;
    this.el.appendChild(
      h(
        'button.dock-app',
        {
          dataset: { simTarget: 'dock:trash', dockApp: 'trash' },
          title: trashFull ? `ถังขยะ (${s.trash.length} รายการ)` : 'ถังขยะว่าง',
          onclick: () => {
            this.sim.emit({ type: 'dock:click', app: 'trash' });
            this.sim.openTrash();
          },
        },
        h('div.dock-icon trash-icon', { html: trashFull ? ICONS['trash-full'] ?? '' : ICONS['trash'] ?? '' }),
        h('span.dock-dot'),
        h('span.dock-tip', { text: trashFull ? `ถังขยะ • ${s.trash.length} รายการ` : 'ถังขยะ' }),
      ),
    );
  }

  /** magnification แบบ macOS — ไอคอนขยายตามระยะจากเมาส์ */
  private magnify(e: MouseEvent): void {
    if (!this.sim.store.get().magnification) return;
    const icons = Array.from(this.el.querySelectorAll<HTMLElement>('.dock-app'));
    const rect = this.el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    for (const icon of icons) {
      const ir = icon.getBoundingClientRect();
      const center = ir.left - rect.left + ir.width / 2;
      const dist = Math.abs(center - mx);
      const scale = Math.max(1, 1.55 - dist / 130);
      const iconEl = icon.querySelector<HTMLElement>('.dock-icon');
      if (iconEl) iconEl.style.transform = `scale(${scale}) translateY(${-(scale - 1) * 10}px)`;
    }
    this.sim.emit({ type: 'dock:magnify' });
  }

  private reset(): void {
    this.el.querySelectorAll<HTMLElement>('.dock-icon').forEach((el) => (el.style.transform = ''));
  }
}
