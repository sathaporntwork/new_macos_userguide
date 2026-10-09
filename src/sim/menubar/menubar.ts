/** เมนูบาร์ด้านบน — Apple menu, เมนูแอป, สถานะ, Control Center, นาฬิกา */

import { h, clear } from '../../core/dom';
import { openMenu, closeMenus, type MenuItem } from '../menu';
import { appDisplayName } from '../state';
import type { Simulator } from '../simulator';
import type { AppDef } from '../apps/registry';

export class MenuBar {
  el: HTMLElement;
  private clockEl!: HTMLElement;
  private appNameEl!: HTMLElement;
  private menusEl!: HTMLElement;
  private timer: number;

  constructor(private sim: Simulator) {
    this.el = h('div.sim-menubar', { dataset: { simTarget: 'menubar' } });
    this.render();
    this.timer = window.setInterval(() => {
      if (this.clockEl) this.clockEl.textContent = clockText();
    }, 10000);
  }

  destroy(): void {
    clearInterval(this.timer);
  }

  private render(): void {
    clear(this.el);

    // Apple menu
    this.el.appendChild(
      h('button.mb-apple', {
        dataset: { simTarget: 'menubar:apple' },
        title: 'เมนู Apple',
        html: ' <svg viewBox="0 0 14 17" width="13" height="15"><path fill="currentColor" d="M11.6 9.1c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7C3.4 4.5 2 5.3 1.3 6.6c-1.4 2.5-.4 6.2 1 8.2.7 1 1.5 2.1 2.6 2 1 0 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.7 1.1 0 1.8-1 2.5-2 .8-1.2 1.1-2.3 1.1-2.4 0 0-2.2-.9-2.3-3.3zM9.6 2.8C10.2 2.1 10.6 1.1 10.5 0c-.9 0-2 .6-2.6 1.3-.6.6-1 1.7-.9 2.6 1 .1 2-.5 2.6-1.1z"/></svg>',
        onclick: (e: Event) => this.openAppleMenu(e),
      }),
    );

    // ชื่อแอป + เมนูแอป
    const s = this.sim.store.get();
    const focusedApp = s.focusedApp ?? 'finder';
    const app: AppDef | undefined = this.sim.apps[focusedApp];

    this.appNameEl = h('button.mb-appname', {
      text: app ? app.name : 'Finder',
      dataset: { simTarget: 'menubar:appname' },
      onclick: (e: Event) => this.openAppMenu(app, e),
    });
    this.el.appendChild(this.appNameEl);

    this.menusEl = h('div.mb-menus');
    const menus = this.buildMenus(app);
    for (const m of menus) {
      this.menusEl.appendChild(
        h('button.mb-menu', {
          text: m.title,
          onclick: (e: Event) => this.openMenuAt(m.title, m.items, e),
          onpointerenter: (e: PointerEvent) => {
            // ลากเมาส์ผ่านเมื่อเมนูเปิดอยู่ → สลับเมนูทันที (เหมือน macOS)
            if (this.sim.overlayLayer.querySelector('.sim-menu')) this.openMenuAt(m.title, m.items, e);
          },
        }),
      );
    }
    this.el.appendChild(this.menusEl);

    // ฝั่งขวา: สถานะ
    const right = h('div.mb-right');
    right.appendChild(
      h('button.mb-status', {
        dataset: { simTarget: 'menubar:battery' },
        title: 'แบตเตอรี่ 92%',
        html: `<svg viewBox="0 0 28 13" width="24" height="12"><rect x="0.5" y="0.5" width="22" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".5"/><rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor"/><path d="M24.5 4.5v4c1.2-.3 2-1 2-2s-.8-1.7-2-2z" fill="currentColor" opacity=".5"/></svg>`,
      }),
    );
    right.appendChild(
      h('button.mb-status', {
        dataset: { simTarget: 'menubar:wifi' },
        title: s.wifi ? 'Wi-Fi: บ้านสบาย 5G' : 'Wi-Fi ปิดอยู่',
        text: s.wifi ? '📶' : '📵',
        onclick: () => this.sim.openApp('settings'),
      }),
    );
    right.appendChild(
      h('button.mb-status', {
        dataset: { simTarget: 'menubar:spotlight' },
        title: 'Spotlight ค้นหา (⌘Space)',
        html: '🔍',
        onclick: () => this.sim.toggleSpotlight(),
      }),
    );
    right.appendChild(
      h('button.mb-status', {
        dataset: { simTarget: 'menubar:controlcenter' },
        title: 'Control Center',
        html: '<svg viewBox="0 0 16 16" width="15" height="15"><path fill="currentColor" d="M4.5 1v4.1a3 3 0 1 0 1 0V1h-1zm6 0v1.1a3 3 0 1 0 1 0V1h-1zM4.5 9.9V15h1V9.9a3 3 0 1 0-1 0zm6-2V15h1V7.9a3 3 0 1 0-1 0z" transform="scale(0.85) translate(1.4 1.4)"/><rect x="4" y="1" width="1.6" height="4" rx="0.8" fill="currentColor"/><circle cx="4.8" cy="8" r="2.6" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="10.4" y="1" width="1.6" height="1.6" rx="0.8" fill="currentColor"/><circle cx="11.2" cy="6" r="2.6" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="4" y="10.4" width="1.6" height="4.6" rx="0.8" fill="currentColor"/><rect x="10.4" y="7.6" width="1.6" height="7.4" rx="0.8" fill="currentColor"/></svg>',
        onclick: (e: Event) => this.toggleControlCenter(e),
      }),
    );
    this.clockEl = h('button.mb-clock', { dataset: { simTarget: 'menubar:clock' }, text: clockText() });
    right.appendChild(this.clockEl);
    this.el.appendChild(right);
  }

  private buildMenus(app: AppDef | undefined): { title: string; items: MenuItem[] }[] {
    const sim = this.sim;
    const stdEdit: { title: string; items: MenuItem[] } = {
      title: 'แก้ไข',
      items: [
        { label: 'คัดลอก', shortcut: '⌘C', onclick: () => sim.performShortcut('cmd+c') },
        { label: 'วาง', shortcut: '⌘V', onclick: () => sim.performShortcut('cmd+v') },
        { label: 'เลือกทั้งหมด', shortcut: '⌘A', onclick: () => {} },
      ],
    };
    const stdWindow: { title: string; items: MenuItem[] } = {
      title: 'หน้าต่าง',
      items: [
        { label: 'ย่อหน้าต่าง', shortcut: '⌘M', onclick: () => sim.minimizeFocused() },
        { label: 'ย่อหน้าต่างทั้งหมดของแอปนี้', shortcut: '⌥⌘M', onclick: () => sim.minimizeAppAll(app?.id ?? 'finder') },
        { label: 'ซูม', onclick: () => sim.zoomFocused() },
        { separator: true },
        { label: 'นำทั้งหมดมาไว้ข้างหน้า', onclick: () => sim.openApp(app?.id ?? 'finder') },
      ],
    };
    const stdHelp: { title: string; items: MenuItem[] } = {
      title: 'ช่วยเหลือ',
      items: [{ label: 'ช่วยเหลือ ' + (app?.name ?? 'macOS'), onclick: () => sim.openApp('safari') }],
    };

    if (app?.menus) {
      return [...app.menus(sim), stdEdit, stdWindow, stdHelp];
    }
    // เมนู Finder มาตรฐาน
    return [
      {
        title: 'ไฟล์',
        items: [
          { label: 'โฟลเดอร์ใหม่', shortcut: '⇧⌘N', onclick: () => sim.emit({ type: 'finder:newFolder' }) },
          { label: 'หน้าต่าง Finder ใหม่', shortcut: '⌘N', onclick: () => sim.openApp('finder') },
          { separator: true },
          { label: 'ย้ายไปถังขยะ', shortcut: '⌘⌫', onclick: () => sim.performShortcut('cmd+delete') },
        ],
      },
      stdEdit,
      {
        title: 'มุมมอง',
        items: [
          { label: 'แสดงเป็นไอคอน', shortcut: '⌘1', onclick: () => sim.emit({ type: 'finder:view', view: 'icon' }) },
          { label: 'แสดงเป็นรายการ', shortcut: '⌘2', onclick: () => sim.emit({ type: 'finder:view', view: 'list' }) },
        ],
      },
      {
        title: 'ไปที่',
        items: [
          { label: 'เดสก์ท็อป', shortcut: '⇧⌘D', onclick: () => sim.openApp('finder', { path: ['Users', 'somchai', 'Desktop'] }) },
          { label: 'เอกสาร', shortcut: '⇧⌘O', onclick: () => sim.openApp('finder', { path: ['Users', 'somchai', 'Documents'] }) },
          { label: 'ดาวน์โหลด', shortcut: '⌥⌘L', onclick: () => sim.openApp('finder', { path: ['Users', 'somchai', 'Downloads'] }) },
        ],
      },
      stdWindow,
      stdHelp,
    ];
  }

  private menuXY(e: Event): { x: number; y: number } {
    const btn = e.currentTarget as HTMLElement;
    const root = this.sim.root.getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    return { x: r.left - root.left, y: r.bottom - root.top + 2 };
  }

  private wrapEmit(title: string, items: MenuItem[]): MenuItem[] {
    return items.map((it) =>
      it.separator
        ? it
        : {
            ...it,
            onclick: () => {
              this.sim.emit({ type: 'menu:click', menu: title, item: it.label ?? '' });
              it.onclick?.();
            },
          },
    );
  }

  private openMenuAt(title: string, items: MenuItem[], e: Event): void {
    const { x, y } = this.menuXY(e);
    this.sim.emit({ type: 'menu:open', menu: title });
    openMenu(this.sim, this.wrapEmit(title, items), x, y, 'from-menubar');
  }

  private openAppMenu(app: AppDef | undefined, e: Event): void {
    const sim = this.sim;
    const name = app?.name ?? 'Finder';
    const items: MenuItem[] = [
      { label: `เกี่ยวกับ${name}`, onclick: () => sim.openApp('about') },
      { separator: true },
      { label: 'การตั้งค่า…', shortcut: '⌘,', onclick: () => sim.openApp('settings') },
      { separator: true },
      { label: 'ซ่อน' + name + ' (ทั้งแอป)', shortcut: '⌘H', onclick: () => sim.hideApp(app?.id ?? 'finder') },
      { separator: true },
      { label: `เลิกทำงาน${name}`, shortcut: '⌘Q', onclick: () => sim.quitApp(app?.id ?? 'finder') },
    ];
    const { x, y } = this.menuXY(e);
    this.sim.emit({ type: 'menu:open', menu: name });
    openMenu(sim, this.wrapEmit(name, items), x, y, 'from-menubar');
  }

  private openAppleMenu(e: Event): void {
    const sim = this.sim;
    const { x, y } = this.menuXY(e);
    sim.emit({ type: 'menu:open', menu: 'Apple' });
    openMenu(
      sim,
      [
        { label: 'เกี่ยวกับเครื่องนี้', onclick: () => { sim.emit({ type: 'apple:about' }); sim.openApp('about'); } },
        { separator: true },
        { label: 'การตั้งค่าระบบ…', onclick: () => { sim.emit({ type: 'apple:settings' }); sim.openApp('settings'); } },
        { label: 'App Store…', onclick: () => sim.openApp('appstore') },
        { separator: true },
        {
          label: 'Force Quit…',
          shortcut: '⌥⌘⎋',
          onclick: () => {
            sim.emit({ type: 'apple:forcequit' });
            const s = sim.store.get();
            const apps = s.runningApps.filter((a) => a !== 'finder');
            const { x: x2, y: y2 } = this.menuXY(e);
            openMenu(
              sim,
              apps.length
                ? apps.map((a) => ({
                    label: appDisplayName(a),
                    danger: true,
                    onclick: () => sim.quitApp(a),
                  }))
                : [{ label: 'ไม่มีแอปที่ตอบสนองช้า', disabled: true }],
              x2 + 160,
              y2,
            );
          },
        },
        { separator: true },
        { label: 'หยุดพัก', onclick: () => { sim.emit({ type: 'apple:sleep' }); sim.sleep(); } },
        { label: 'รีสตาร์ท…', onclick: () => sim.sleep(true) },
        { label: 'ปิดเครื่อง…', onclick: () => sim.sleep(true) },
        { separator: true },
        { label: 'ล็อกหน้าจอ', shortcut: '⌃⌘Q', onclick: () => sim.sleep() },
      ],
      x,
      y,
      'from-menubar',
    );
  }

  private toggleControlCenter(e: Event): void {
    e.stopPropagation();
    this.sim.toggleControlCenter(e.currentTarget as HTMLElement);
  }

  rerender(): void {
    closeMenus(this.sim);
    this.render();
  }
}

function clockText(): string {
  const d = new Date();
  const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const time = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${time}`;
}
