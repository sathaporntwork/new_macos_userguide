/** System Settings — คู่กับ Control Panel / Settings ของ Windows */

import { h, clear } from '../../core/dom';
import { ACCENTS, WALLPAPERS } from '../state';
import type { AppDef } from './registry';

type PaneId = 'general' | 'appearance' | 'wallpaper' | 'dock' | 'mouse' | 'wifi';

const PANES: { id: PaneId; label: string; glyph: string; color: string }[] = [
  { id: 'wifi', label: 'Wi-Fi', glyph: '𝇋', color: '#0a84ff' },
  { id: 'general', label: 'ทั่วไป', glyph: '⚙', color: '#8e8e93' },
  { id: 'appearance', label: 'รูปลักษณ์', glyph: '◐', color: '#1d1d1f' },
  { id: 'wallpaper', label: 'ภาพพื้นหลัง', glyph: '🖼', color: '#0a84ff' },
  { id: 'dock', label: 'เดสก์ท็อปและ Dock', glyph: '⊞', color: '#1d6ef5' },
  { id: 'mouse', label: 'เมาส์', glyph: '🖱', color: '#8e8e93' },
];

function toggle(value: boolean, onchange: (v: boolean) => void, target?: string): HTMLElement {
  const el = h('button.switch', {
    dataset: { simTarget: target ?? '' },
    class: value ? 'on' : '',
    role: 'switch',
    ariaChecked: String(value),
    onclick: () => onchange(!value),
  });
  return el;
}

function row(label: string, desc: string, control: HTMLElement): HTMLElement {
  return h(
    'div.set-row',
    h('div.set-row-text', h('div.set-row-label', { text: label }), desc ? h('div.set-row-desc', { text: desc }) : null),
    control,
  );
}

function group(title: string, ...rows: HTMLElement[]): HTMLElement {
  return h('div.set-group', title ? h('div.set-group-title', { text: title }) : null, h('div.set-group-card', ...rows));
}

export const settingsApp: AppDef = {
  id: 'settings',
  name: 'การตั้งค่าระบบ',
  en: 'System Settings',
  icon: 'settings',
  dock: true,
  w: 760,
  h: 520,

  menus: (sim) => [
    {
      title: 'การตั้งค่าระบบ',
      items: [
        { label: 'เกี่ยวกับการตั้งค่าระบบ', onclick: () => sim.openApp('about') },
        { separator: true },
        { label: 'เลิกทำงานการตั้งค่าระบบ', shortcut: '⌘Q', onclick: () => sim.quitApp('settings') },
      ],
    },
  ],

  render(body, sim) {
    body.classList.add('settings');
    let pane: PaneId = 'appearance';

    const sideEl = h('nav.set-sidebar');
    const contentEl = h('div.set-content', { dataset: { simTarget: 'settings-content' } });
    const titleEl = h('div.set-title');

    body.append(
      h('div.set-head', h('div.set-appicon', { html: '', }), titleEl),
      h('div.set-main', sideEl, contentEl),
    );

    function buildSidebar(): void {
      clear(sideEl);
      for (const p of PANES) {
        sideEl.appendChild(
          h(
            'button.set-side-item',
            {
              dataset: { simTarget: `settings-pane:${p.id}` },
              class: pane === p.id ? 'active' : '',
              onclick: () => {
                pane = p.id;
                sim.emit({ type: 'settings:pane', pane: p.id });
                render();
              },
            },
            h('span.set-glyph', { text: p.glyph, style: { background: p.color } }),
            h('span', { text: p.label }),
          ),
        );
      }
    }

    function render(): void {
      buildSidebar();
      const s = sim.store.get();
      const def = PANES.find((p) => p.id === pane)!;
      titleEl.textContent = def.label;
      clear(contentEl);

      switch (pane) {
        case 'appearance': {
          contentEl.append(
            group(
              'รูปลักษณ์',
              h(
                'div.appearance-cards',
                ...(['light', 'dark'] as const).map((mode) =>
                  h(
                    'button.appear-card',
                    {
                      dataset: { simTarget: `appearance:${mode}` },
                      class: s.appearance === mode ? 'active' : '',
                      onclick: () => {
                        sim.setAppearance(mode);
                      },
                    },
                    h('div.appear-preview', { class: mode }),
                    h('span', { text: mode === 'light' ? 'โหมดสว่าง' : 'โหมดมืด' }),
                  ),
                ),
              ),
            ),
            group(
              'สีเน้น (Accent color)',
              h(
                'div.accent-row',
                ...ACCENTS.map((a) =>
                  h('button.accent-dot', {
                    dataset: { simTarget: `accent:${a.id}`, accent: a.id },
                    class: s.accent === a.id ? 'active' : '',
                    title: a.name,
                    style: { background: a.color },
                    onclick: () => sim.emit({ type: 'settings:accent' }),
                  }),
                ),
              ),
            ),
            h('p.set-note', {
              html: '💡 <b>เทียบกับ Windows:</b> การตั้งค่าธีมสว่าง/มืดใน Windows อยู่ที่ Personalization แต่ใน Mac อยู่ที่ System Settings → รูปลักษณ์',
            }),
          );
          break;
        }

        case 'wallpaper': {
          contentEl.append(
            group(
              'เลือกภาพพื้นหลัง',
              h(
                'div.wall-grid',
                ...WALLPAPERS.map((wp) =>
                  h(
                    'button.wall-thumb',
                    {
                      dataset: { simTarget: `wallpaper:${wp.id}`, wallpaper: wp.id },
                      class: s.wallpaper === wp.id ? 'active' : '',
                      onclick: () => sim.setWallpaper(wp.id),
                    },
                    h('div.wall-preview', { style: { background: wp.css } }),
                    h('span', { text: wp.name }),
                  ),
                ),
              ),
            ),
          );
          break;
        }

        case 'dock': {
          contentEl.append(
            group(
              'Dock',
              row(
                'ขนาดไอคอน',
                'ปรับขนาด Dock ให้เหมาะกับหน้าจอ',
                h('input.range', {
                  dataset: { simTarget: 'dock-size' },
                  type: 'range',
                  min: '0.6',
                  max: '1.4',
                  step: '0.05',
                  value: String(s.dockSize),
                  oninput: (e: Event) => sim.setDockSize(Number((e.target as HTMLInputElement).value)),
                }) as HTMLElement,
              ),
              row('เอฟเฟกต์ขยาย (Magnification)', 'เอาเมาส์ชี้ที่ Dock แล้วไอคอนขยายตาม', toggle(s.magnification, (v) => sim.setMagnification(v))),
              row(
                'Stage Manager',
                'จัดหน้าต่างแบบโปร โฟกัสหน้าเดียว เหลือเรียงซ้าย',
                toggle(s.stageManager, (v) => sim.setStageManager(v), 'stage-toggle'),
              ),
            ),
            group(
              'Hot Corners (มุมลัด)',
              ...(['tl', 'tr', 'bl', 'br'] as const).map((corner) =>
                row(
                  { tl: 'มุมบนซ้าย', tr: 'มุมบนขวา', bl: 'มุมล่างซ้าย', br: 'มุมล่างขวา' }[corner],
                  'เอาเมาส์ชนมุมจอแล้วทำงานทันที',
                  h(
                    'select.mini-select',
                    {
                      dataset: { simTarget: `hotcorner:${corner}` },
                      onchange: (e: Event) => sim.emit({ type: 'settings:hotcorner', corner: (e.target as HTMLSelectElement).value }),
                    },
                    ...['-', 'Mission Control', 'Launchpad', 'หน้าจอนอน'].map((o) => h('option', { value: o, text: o, selected: s.hotCorners[corner] === o })),
                  ),
                ),
              ),
            ),
          );
          break;
        }

        case 'mouse': {
          contentEl.append(
            group(
              'การเลื่อนหน้าจอ',
              row(
                'Natural scrolling',
                'เนื้อหาเลื่อนตามนิ้ว (สไตล์ Mac) — ต่างจาก Windows!',
                toggle(s.naturalScroll, (v) => sim.setNaturalScroll(v), 'naturalscroll-toggle'),
              ),
            ),
            h('p.set-note', {
              html: '💡 <b>เทียบกับ Windows:</b> ถ้ารู้สึกว่าล้อเมาส์เลื่อน "ย้อนทาง" ให้ปิด Natural scrolling หรือซ้อมจนชิน — คนส่วนใหญ่ชินใน 2–3 วัน',
            }),
          );
          break;
        }

        case 'wifi': {
          contentEl.append(
            group('Wi-Fi', row('Wi-Fi', 'เชื่อมต่ออินเทอร์เน็ต', toggle(s.wifi, (v) => sim.store.update(() => ({ wifi: v })), 'wifi-toggle'))),
            group(
              'เครือข่ายที่รู้จัก',
              ...[['บ้านสบาย 5G', true], ['CoffeeShop_Free', false], ['Office-WiFi', false]].map(([name, strong]) =>
                h(
                  'div.set-row',
                  h('div.set-row-text', h('div.set-row-label', { text: String(name) })),
                  h('span.wifi-strength', { text: strong ? '📶📶📶' : '📶📶' }),
                ),
              ),
            ),
          );
          break;
        }

        case 'general': {
          contentEl.append(
            group(
              'เกี่ยวกับเครื่อง',
              row('ชื่อเครื่อง', '', h('span.set-value', { text: 'MacBook Pro ของ Somchai' })),
              row('ชิป', '', h('span.set-value', { text: 'Apple M4 Pro' })),
              row('หน่วยความจำ', '', h('span.set-value', { text: '24 GB' })),
              row('macOS', '', h('span.set-value', { text: 'Tahoe 26.0.1' })),
              row('หมายเลขซีเรียล', '', h('span.set-value', { text: 'C02•••••••TH' })),
            ),
            group(
              'การอัปเดตซอฟต์แวร์',
              row('Mac ของคุณเป็นเวอร์ชันล่าสุด', 'อัปเดตล่าสุด: 6 ต.ค. 2569', h('button.btn-small', { text: 'ตรวจสอบ', onclick: () => {} })),
            ),
          );
          break;
        }
      }
    }

    render();
    const unsub = sim.store.subscribe(() => render());
    body.addEventListener('simdestroy', unsub, { once: true });
  },
};
