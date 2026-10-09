/** Launchpad, Mission Control, Control Center, App Switcher */

import { h, clear } from '../../core/dom';
import { WALLPAPERS } from '../state';
import { ICONS } from '../icons';
import type { Simulator } from '../simulator';

// ---------- Launchpad ----------

export function renderLaunchpad(sim: Simulator): HTMLElement {
  const el = h('div.overlay-launchpad', { dataset: { simTarget: 'launchpad' }, onclick: (e: MouseEvent) => {
    if (e.target === el) sim.closeOverlay('launchpad');
  } });
  const grid = h('div.lp-grid');
  const search = h('input.lp-search', { type: 'text', placeholder: '🔍 ค้นหา', dataset: { simTarget: 'launchpad-search' } }) as HTMLInputElement;

  const rebuild = () => {
    clear(grid);
    const q = search.value.trim().toLowerCase();
    for (const app of Object.values(sim.apps)) {
      if (!app.dock || app.id === 'launchpad') continue;
      if (q && !app.name.toLowerCase().includes(q) && !app.en.toLowerCase().includes(q)) continue;
      grid.appendChild(
        h(
          'button.lp-app',
          {
            dataset: { simTarget: `launchpad-app:${app.id}` },
            onclick: () => {
              sim.emit({ type: 'app:open', app: app.id });
              sim.openApp(app.id);
              sim.closeOverlay('launchpad');
            },
          },
          h('div.lp-icon', { html: ICONS[app.icon] ?? '' }),
          h('span.lp-name', { text: app.name }),
        ),
      );
    }
  };
  search.oninput = rebuild;
  search.onkeydown = (e) => {
    e.stopPropagation();
    if (e.key === 'Escape') sim.closeOverlay('launchpad');
  };

  el.append(search, grid);
  rebuild();
  setTimeout(() => search.focus(), 30);
  return el;
}

// ---------- Mission Control ----------

export function renderMissionControl(sim: Simulator): HTMLElement {
  const s = sim.store.get();
  const el = h('div.overlay-mc', { dataset: { simTarget: 'missioncontrol' }, onclick: (e: MouseEvent) => {
    if (e.target === el) sim.closeMissionControl();
  } });

  // แถบ Spaces ด้านบน
  const strip = h(
    'div.mc-spaces',
    { dataset: { simTarget: 'mc-spaces' } },
    ...s.spaces.map((name, i) =>
      h(
        'button.mc-space',
        {
          dataset: { simTarget: `mc-space:${i}` },
          class: i === s.currentSpace ? 'current' : '',
          onclick: () => {
            sim.switchSpace(i);
            sim.closeMissionControl();
          },
        },
        h('div.mc-space-thumb', { style: { background: WALLPAPERS.find((w) => w.id === s.wallpaper)?.css } }),
        h('span', { text: name }),
      ),
    ),
    h('button.mc-space-add', {
      dataset: { simTarget: 'mc-addspace' },
      title: 'เพิ่ม Desktop ใหม่',
      text: '＋',
      onclick: () => {
        sim.createSpace();
      },
    }),
  );

  // หน้าต่างทั้งหมดของ space ปัจจุบัน
  const wins = s.windows.filter((w) => w.space === s.currentSpace && !w.minimized);
  const grid = h(
    'div.mc-windows',
    { dataset: { simTarget: 'mc-windows' } },
    ...(wins.length
      ? wins.map((w) =>
          h(
            'div.mc-win',
            {
              dataset: { simTarget: `mc-win:${w.app}` },
              title: 'คลิกเพื่อสลับไปหน้าต่าง • ลากไปวางบน Desktop ด้านบนเพื่อย้าย Space',
              onclick: () => {
                sim.switchSpace(w.space);
                sim.focusWindow(w.id);
                sim.closeMissionControl();
              },
              draggable: false,
              onpointerdown: (e: PointerEvent) => startMcDrag(e, w.id, el),
            },
            h('div.mc-win-app', { html: ICONS[sim.apps[w.app]?.icon ?? 'finder'] }),
            h('div.mc-win-title', { text: w.title }),
          ),
        )
      : [h('div.mc-empty', { text: 'ยังไม่มีหน้าต่างเปิดอยู่ — เปิดแอปจาก Dock ก่อน แล้วกด F3 อีกครั้ง' })]),
  );

  el.append(strip, grid);
  return el;
}

function startMcDrag(e: PointerEvent, winId: string, container: HTMLElement): void {
  e.preventDefault();
  const ghost = (e.currentTarget as HTMLElement).cloneNode(true) as HTMLElement;
  ghost.classList.add('mc-ghost');
  ghost.style.left = `${e.clientX}px`;
  ghost.style.top = `${e.clientY}px`;
  container.appendChild(ghost);

  const onMove = (ev: PointerEvent) => {
    ghost.style.left = `${ev.clientX}px`;
    ghost.style.top = `${ev.clientY}px`;
  };
  const onUp = (ev: PointerEvent) => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    ghost.remove();
    // หา space ที่จุดวาง
    const spaceEls = Array.from(container.querySelectorAll<HTMLElement>('.mc-space'));
    for (let i = 0; i < spaceEls.length; i++) {
      const r = spaceEls[i]!.getBoundingClientRect();
      if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) {
        window.dispatchEvent(new CustomEvent('sim-move-space', { detail: { winId, space: i } }));
        return;
      }
    }
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
}

// ---------- Control Center ----------

export function renderControlCenter(sim: Simulator): HTMLElement {
  const s = sim.store.get();
  const el = h('div.overlay-cc', { dataset: { simTarget: 'controlcenter' } });

  const tile = (label: string, sub: string, on: boolean, glyph: string, target: string, cb: (v: boolean) => void) =>
    h(
      'button.cc-tile',
      { dataset: { simTarget: target }, class: on ? 'on' : '', onclick: () => cb(!on) },
      h('span.cc-glyph', { text: glyph }),
      h('div.cc-txt', h('b', { text: label }), h('span.cc-dim', { text: sub })),
    );

  el.append(
    h(
      'div.cc-grid',
      tile('Wi-Fi', s.wifi ? 'บ้านสบาย 5G' : 'ปิดอยู่', s.wifi, '📶', 'cc-wifi', (v) => {
        sim.store.update(() => ({ wifi: v }));
        sim.emit({ type: 'controlcenter:toggle', control: 'wifi', value: v });
        refresh();
      }),
      tile('Bluetooth', s.bluetooth ? 'เปิด' : 'ปิด', s.bluetooth, '🔵', 'cc-bluetooth', (v) => {
        sim.store.update(() => ({ bluetooth: v }));
        sim.emit({ type: 'controlcenter:toggle', control: 'bluetooth', value: v });
        refresh();
      }),
      tile('โหมดห้ามรบกวน', s.dnd ? 'เปิด' : 'ปิด', s.dnd, '🌙', 'cc-dnd', (v) => {
        sim.store.update(() => ({ dnd: v }));
        sim.emit({ type: 'controlcenter:toggle', control: 'dnd', value: v });
        refresh();
      }),
    ),
    h(
      'div.cc-row',
      tile(s.appearance === 'dark' ? 'โหมดมืด' : 'โหมดสว่าง', 'สลับธีมหน้าจอ', s.appearance === 'dark', '◐', 'cc-appearance', () => {
        sim.setAppearance(s.appearance === 'dark' ? 'light' : 'dark');
        refresh();
      }),
      tile('Stage Manager', s.stageManager ? 'เปิดอยู่' : 'ปิดอยู่', s.stageManager, '🗂', 'cc-stage', () => {
        sim.setStageManager(!s.stageManager);
        refresh();
      }),
    ),
    h(
      'div.cc-slider-card',
      h('span', { text: '🔆 ความสว่างหน้าจอ' }),
      h('input.range', { type: 'range', min: '30', max: '100', value: '85', oninput: () => {} }),
    ),
    h(
      'div.cc-slider-card',
      h('span', { text: '🔊 ระดับเสียง' }),
      h('input.range', { type: 'range', min: '0', max: '100', value: '60', oninput: () => {} }),
    ),
    h('div.cc-nowplaying', h('span', { text: '♫' }), h('div', h('b', { text: 'Jaipur Sunrise' }), h('span.cc-dim', { text: 'Thai Chill Mix' }))),
  );

  function refresh(): void {
    const parent = el.parentElement;
    if (parent) {
      el.remove();
      parent.appendChild(renderControlCenter(sim));
    }
  }

  el.addEventListener('pointerdown', (e) => e.stopPropagation());
  return el;
}

// ---------- App Switcher (⌘Tab) ----------

export function renderAppSwitcher(sim: Simulator, selectedApp: string): HTMLElement {
  const s = sim.store.get();
  const el = h(
    'div.overlay-switcher',
    { dataset: { simTarget: 'appswitcher' } },
    h(
      'div.switcher-row',
      ...s.runningApps.map((id) =>
        h(
          'div.switcher-app',
          { class: id === selectedApp ? 'sel' : '' },
          h('div.sw-icon', { html: ICONS[sim.apps[id]?.icon ?? 'finder'] ?? '' }),
        ),
      ),
    ),
  );
  return el;
}
