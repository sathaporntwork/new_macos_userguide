/** Simulator — ประกอบ desktop + menubar + dock + windows + overlays เป็น macOS จำลอง */

import { h, clear } from '../core/dom';
import { bus, type SimEvent } from '../core/events';
import { Store } from '../core/store';
import { clamp, normalizeKey } from '../core/utils';
import {
  defaultState,
  appDisplayName,
  resolvePath,
  removeNode,
  createFile,
  WALLPAPERS,
  type FSNode,
  type SimState,
  type WindowState,
} from './state';
import { WindowManager } from './windows/windowManager';
import { MenuBar } from './menubar/menubar';
import { Dock } from './dock/dock';
import { Desktop } from './desktop/desktop';
import { closeMenus } from './menu';
import { renderSpotlight } from './overlays/spotlight';
import { renderLaunchpad, renderMissionControl, renderControlCenter, renderAppSwitcher } from './overlays/overlays';
import { finderApp } from './apps/finder';
import { settingsApp } from './apps/settings';
import { terminalApp } from './apps/terminal';
import { notesApp, createNoteInStore } from './apps/notes';
import { safariApp } from './apps/safari';
import { aboutApp, activityApp, mailApp, photosApp, calendarApp, appstoreApp } from './apps/misc';
import type { AppDef } from './apps/registry';

const OVERLAY_NAMES = ['spotlight', 'launchpad', 'missioncontrol', 'controlcenter', 'appswitcher'] as const;
export type OverlayName = (typeof OVERLAY_NAMES)[number];

export interface SimOptions {
  playground?: boolean;
  initial?: Partial<SimState>;
}

export class Simulator {
  root: HTMLElement;
  overlayLayer: HTMLElement;
  menuCleanups: (() => void)[] = [];
  apps: Record<string, AppDef>;
  store: Store<SimState>;
  active = true;
  playground: boolean;

  private wm: WindowManager;
  private menuBar: MenuBar;
  private dock: Dock;
  private desktop: Desktop;
  private unsubs: (() => void)[] = [];
  private lastShellSig = '';
  private lastOverlaySig = '';
  private switcherTarget: string | null = null;
  private switcherTimer: number | null = null;
  private lastSelectedFile: string | null = null;

  constructor(container: HTMLElement, opts: SimOptions = {}) {
    this.playground = opts.playground ?? false;
    const state = { ...defaultState(), ...(opts.initial ?? {}) };
    state.windows = state.windows.map((w) => ({ ...w }));
    this.store = new Store<SimState>(state);

    this.root = h('div.sim', { tabindex: '0', dataset: { simTarget: 'sim-root' } });
    this.overlayLayer = h('div.sim-overlaylayer');

    this.apps = {
      finder: finderApp,
      launchpad: this.launchpadApp(),
      settings: settingsApp,
      terminal: terminalApp,
      notes: notesApp,
      safari: safariApp,
      mail: mailApp,
      photos: photosApp,
      calendar: calendarApp,
      about: aboutApp,
      activity: activityApp,
      appstore: appstoreApp,
      quicklook: this.quickLookApp(),
    };

    this.desktop = new Desktop(this);
    this.wm = new WindowManager(this, this.store);
    this.menuBar = new MenuBar(this);
    this.dock = new Dock(this);

    this.root.append(this.menuBar.el, this.desktop.el, this.wm.element, this.dock.el, this.overlayLayer);
    container.appendChild(this.root);

    // Stage Manager + space filtering อยู่ใน sync ของ wm (ผ่าน store subscribe ของ wm เอง)
    this.unsubs.push(
      this.store.subscribe(() => {
        this.syncShell();
        this.syncOverlays();
        this.applyStageManager();
      }),
    );
    this.root.addEventListener('keydown', this.onKeydown);
    window.addEventListener('sim-move-space', this.onMoveSpace as EventListener);
    this.applyAppearance();
    this.syncShell();
    this.syncOverlays();
  }

  // ---------- events ----------

  emit(event: SimEvent): void {
    bus.emit(event);
  }

  destroy(): void {
    this.unsubs.forEach((u) => u());
    this.menuBar.destroy();
    this.root.removeEventListener('keydown', this.onKeydown);
    window.removeEventListener('sim-move-space', this.onMoveSpace as EventListener);
    this.root.remove();
  }

  reset(initial?: Partial<SimState>): void {
    const state = { ...defaultState(), ...(initial ?? {}) };
    state.windows = state.windows.map((w) => ({ ...w }));
    this.store.set(state);
  }

  // ---------- shell rendering ----------

  private syncShell(): void {
    const s = this.store.get();
    const sig = [s.focusedApp, s.runningApps.join(','), s.trash.length, s.wallpaper].join('|');
    if (sig !== this.lastShellSig) {
      this.lastShellSig = sig;
      this.menuBar.rerender();
      this.dock.render();
    }
  }

  private applyAppearance(): void {
    const s = this.store.get();
    this.root.dataset.appearance = s.appearance;
    this.root.style.setProperty('--dock-scale', String(s.dockSize));
    const accent = { blue: '#0a84ff', purple: '#bf5af2', pink: '#ff375f', orange: '#ff9f0a', green: '#30d158', graphite: '#8e8e93' }[s.accent] ?? '#0a84ff';
    this.root.style.setProperty('--sim-accent', accent);
  }

  private syncOverlays(): void {
    const s = this.store.get();
    const sig = Object.entries(s.overlays).map(([k, v]) => `${k}:${v}`).join(',') + `|${s.spaces.length}|${s.currentSpace}`;
    if (sig === this.lastOverlaySig) return;
    this.lastOverlaySig = sig;

    clear(this.overlayLayer);
    closeMenus(this);
    if (s.overlays.spotlight) this.overlayLayer.appendChild(h('div.overlay-backdrop.spot', renderSpotlight(this)));
    if (s.overlays.launchpad) this.overlayLayer.appendChild(h('div.overlay-backdrop.lp', renderLaunchpad(this)));
    if (s.overlays.missioncontrol) this.overlayLayer.appendChild(h('div.overlay-backdrop.mc', renderMissionControl(this)));
    if (s.overlays.controlcenter) this.overlayLayer.appendChild(h('div.overlay-backdrop.cc', renderControlCenter(this)));
    if (s.overlays.appswitcher && this.switcherTarget) this.overlayLayer.appendChild(renderAppSwitcher(this, this.switcherTarget));
    this.applyAppearance();
  }

  private applyStageManager(): void {
    const s = this.store.get();
    this.wm.element.classList.toggle('stage-on', s.stageManager);
  }

  // ---------- overlays ----------

  setOverlay(name: OverlayName, open: boolean): void {
    this.store.update((s) => ({ overlays: { ...s.overlays, [name]: open } }));
  }

  closeOverlay(name: OverlayName): void {
    this.setOverlay(name, false);
  }

  toggleSpotlight(): void {
    const open = !this.store.get().overlays.spotlight;
    this.setOverlay('spotlight', open);
    if (open) this.emit({ type: 'spotlight:open' });
    else this.emit({ type: 'spotlight:close' });
  }

  toggleLaunchpad(): void {
    const open = !this.store.get().overlays.launchpad;
    this.setOverlay('launchpad', open);
    if (open) this.emit({ type: 'launchpad:open' });
    else this.emit({ type: 'launchpad:close' });
  }

  toggleMissionControl(): void {
    const open = !this.store.get().overlays.missioncontrol;
    this.setOverlay('missioncontrol', open);
    if (open) this.emit({ type: 'missioncontrol:open' });
    else this.emit({ type: 'missioncontrol:close' });
  }

  closeMissionControl(): void {
    this.setOverlay('missioncontrol', false);
  }

  toggleControlCenter(anchor?: HTMLElement): void {
    const open = !this.store.get().overlays.controlcenter;
    this.setOverlay('controlcenter', open);
    if (open) {
      this.emit({ type: 'controlcenter:open' });
      const cc = this.overlayLayer.querySelector<HTMLElement>('.overlay-cc');
      if (cc && anchor) {
        const root = this.root.getBoundingClientRect();
        const ar = anchor.getBoundingClientRect();
        cc.style.right = `${Math.max(8, root.right - ar.right - 8)}px`;
      }
    }
  }

  // ---------- แอปและหน้าต่าง ----------

  openApp(appId: string, payload?: Record<string, unknown>): void {
    const app = this.apps[appId];
    if (!app) return;
    this.store.update((s) => {
      const existing = s.windows.filter((w) => w.app === appId);
      let windows = s.windows;
      if (existing.length > 0 && appId !== 'finder') {
        // แอปเดียวหน้าต่างเดียว (ยกเว้น Finder) — focus ที่มีอยู่
        const target = existing[existing.length - 1]!;
        windows = windows.map((w) => (w.id === target.id ? { ...w, minimized: false, z: s.zCounter + 1, space: s.currentSpace } : w));
      } else if (existing.length > 0 && appId === 'finder' && !payload) {
        const target = existing[existing.length - 1]!;
        windows = windows.map((w) => (w.id === target.id ? { ...w, minimized: false, z: s.zCounter + 1, space: s.currentSpace } : w));
      } else {
        const desk = this.root.getBoundingClientRect();
        const rect = WindowManager.cascade(s.windows.length, app.w, app.h, desk.width, desk.height);
        windows = [
          ...windows,
          {
            id: `win-${appId}-${Date.now() % 100000}`,
            app: appId,
            title: app.name,
            z: s.zCounter + 1,
            minimized: false,
            zoomed: false,
            space: s.currentSpace,
            payload,
            ...rect,
          },
        ];
      }
      return {
        windows,
        zCounter: s.zCounter + 1,
        runningApps: s.runningApps.includes(appId) ? s.runningApps : [...s.runningApps, appId],
        focusedApp: appId,
      };
    });
    this.emit({ type: 'app:open', app: appId });
  }

  quitApp(appId: string): void {
    if (appId === 'finder') {
      // Finder กลับมาทันทีแบบ macOS จริง
      this.emit({ type: 'app:quit', app: appId });
      return;
    }
    this.store.update((s) => ({
      windows: s.windows.filter((w) => w.app !== appId),
      runningApps: s.runningApps.filter((a) => a !== appId),
      focusedApp: s.focusedApp === appId ? null : s.focusedApp,
    }));
    this.emit({ type: 'app:quit', app: appId });
  }

  focusedWindow(): WindowState | undefined {
    const s = this.store.get();
    const app = s.focusedApp;
    const wins = s.windows.filter((w) => w.app === app && !w.minimized && w.space === s.currentSpace);
    return wins.sort((a, b) => b.z - a.z)[0];
  }

  focusWindow(id: string): void {
    this.store.update((s) => {
      const win = s.windows.find((w) => w.id === id);
      if (!win) return {};
      return {
        windows: s.windows.map((w) => (w.id === id ? { ...w, z: s.zCounter + 1, minimized: false } : w)),
        zCounter: s.zCounter + 1,
        focusedApp: win.app,
      };
    });
    const win = this.store.get().windows.find((w) => w.id === id);
    if (win) this.emit({ type: 'window:focus', app: win.app });
  }

  closeWindow(id: string): void {
    const win = this.store.get().windows.find((w) => w.id === id);
    if (!win) return;
    this.store.update((s) => ({
      windows: s.windows.filter((w) => w.id !== id),
      focusedApp: s.focusedApp === win.app ? null : s.focusedApp,
    }));
    this.emit({ type: 'window:close', app: win.app });
  }

  minimizeWindow(id: string): void {
    const win = this.store.get().windows.find((w) => w.id === id);
    if (!win) return;
    this.store.update((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
      focusedApp: s.focusedApp === win.app ? null : s.focusedApp,
    }));
    this.emit({ type: 'app:minimize', app: win.app });
  }

  zoomWindow(id: string): void {
    const win = this.store.get().windows.find((w) => w.id === id);
    if (!win) return;
    this.store.update((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, zoomed: !w.zoomed } : w)),
    }));
    this.emit({ type: 'window:zoom', app: win.app });
  }

  minimizeFocused(): void {
    const w = this.focusedWindow();
    if (w) this.minimizeWindow(w.id);
  }

  zoomFocused(): void {
    const w = this.focusedWindow();
    if (w) this.zoomWindow(w.id);
  }

  dockClickApp(appId: string): void {
    const s = this.store.get();
    if (!s.runningApps.includes(appId)) {
      this.openApp(appId);
      return;
    }
    const wins = s.windows.filter((w) => w.app === appId && !w.minimized);
    if (wins.length === 0) {
      // แอปรันอยู่แต่หน้าต่างถูกย่อ/ปิดหมด → เปิดใหม่หรือเรียกคืน
      const min = s.windows.filter((w) => w.app === appId);
      if (min.length > 0) this.focusWindow(min[min.length - 1]!.id);
      else this.openApp(appId);
    } else {
      const top = wins.sort((a, b) => b.z - a.z)[0]!;
      if (s.focusedApp === appId) this.minimizeWindow(top.id);
      else this.focusWindow(top.id);
    }
  }

  openTrash(): void {
    this.emit({ type: 'trash:open' });
    this.openApp('finder', { trash: true });
  }

  setSelected(name: string | null): void {
    this.lastSelectedFile = name;
  }

  /** Launchpad — ไม่มีหน้าต่างจริง (dock คลิกแล้วเปิด overlay) แต่ต้องมีใน registry เพื่อแสดงบน dock */
  private launchpadApp(): AppDef {
    return {
      id: 'launchpad',
      name: 'Launchpad',
      en: 'Launchpad',
      icon: 'launchpad',
      dock: true,
      w: 400,
      h: 300,
      render: (body) => {
        body.append(h('div.finder-empty', h('div', { text: '🚀' }), h('p', { text: 'Launchpad เปิดจาก Dock เท่านั้น' })));
      },
    };
  }

  // ---------- Quick Look ----------

  private quickLookApp(): AppDef {
    return {
      id: 'quicklook',
      name: 'ดูด่วน',
      en: 'Quick Look',
      icon: 'finder',
      w: 460,
      h: 380,
      render: (body, _sim, win) => {
        const name = (win.payload?.name as string) ?? '';
        const content = (win.payload?.content as string) ?? '';
        body.classList.add('quicklook');
        body.append(
          h('div.ql-icon', { html: (win.payload?.icon as string) ?? '' }),
          h('h3', { text: name }),
          content
            ? h('pre.ql-content', { text: content })
            : h('p.ql-dim', { text: 'ตัวอย่างไฟล์ (Quick Look) — กด Space ปิด' }),
        );
      },
    };
  }

  quickLook(node: FSNode): void {
    this.store.update((s) => {
      const desk = this.root.getBoundingClientRect();
      const rect = WindowManager.cascade(s.windows.length, 460, 380, desk.width, desk.height);
      return {
        windows: [
          ...s.windows,
          {
            id: `win-ql-${Date.now() % 100000}`,
            app: 'quicklook',
            title: node.name,
            z: s.zCounter + 1,
            minimized: false,
            zoomed: false,
            space: s.currentSpace,
            payload: { name: node.name, content: node.content ?? '', icon: node.kind === 'folder' ? '' : '' },
            ...rect,
          },
        ],
        zCounter: s.zCounter + 1,
        focusedApp: 'quicklook',
      };
    });
  }

  quickLookByName(name: string): void {
    const found = this.findFile(this.store.get().fs, name);
    if (found) this.quickLook(found);
  }

  private findFile(root: FSNode, name: string): FSNode | null {
    for (const c of root.children ?? []) {
      if (c.name === name) return c;
      if (c.kind === 'folder') {
        const hit = this.findFile(c, name);
        if (hit) return hit;
      }
    }
    return null;
  }

  // ---------- การตั้งค่า ----------

  setWallpaper(id: string): void {
    this.store.update(() => ({ wallpaper: id }));
    this.emit({ type: 'settings:wallpaper', wallpaper: id });
  }

  setAppearance(mode: 'light' | 'dark'): void {
    this.store.update(() => ({ appearance: mode }));
    this.emit({ type: 'settings:appearance', mode });
  }

  setDockSize(size: number): void {
    this.store.update(() => ({ dockSize: clamp(size, 0.6, 1.4) }));
    this.emit({ type: 'settings:dockSize', size });
  }

  setMagnification(v: boolean): void {
    this.store.update(() => ({ magnification: v }));
  }

  setNaturalScroll(v: boolean): void {
    this.store.update(() => ({ naturalScroll: v }));
    this.emit({ type: 'settings:naturalScroll', value: v });
  }

  setStageManager(v: boolean): void {
    this.store.update(() => ({ stageManager: v }));
    this.emit({ type: 'settings:stageManager', value: v });
  }

  // ---------- Spaces ----------

  switchSpace(index: number): void {
    this.store.update((s) => ({ currentSpace: clamp(index, 0, s.spaces.length - 1) }));
    this.emit({ type: 'space:switch', index });
  }

  createSpace(): void {
    this.store.update((s) => ({ spaces: [...s.spaces, `Desktop ${s.spaces.length + 1}`] }));
    this.emit({ type: 'space:create' });
    this.syncOverlays();
    const s = this.store.get();
    this.switchSpace(s.spaces.length - 1);
  }

  private onMoveSpace = (e: Event): void => {
    const { winId, space } = (e as CustomEvent).detail as { winId: string; space: number };
    this.store.update((s) => ({
      windows: s.windows.map((w) => (w.id === winId ? { ...w, space } : w)),
      currentSpace: space,
    }));
    this.closeMissionControl();
    this.emit({ type: 'space:switch', index: space });
  };

  // ---------- โน้ต ----------

  newNote(): void {
    const id = createNoteInStore(this);
    this.openApp('notes');
    this.emit({ type: 'notes:create' });
    void id;
  }

  // ---------- คีย์ลัด ----------

  performShortcut(keys: string): boolean {
    const s = this.store.get();
    this.emit({ type: 'shortcut', keys });
    switch (keys) {
      case 'cmd+space':
        this.toggleSpotlight();
        return true;
      case 'f3':
      case 'cmd+up':
        this.toggleMissionControl();
        return true;
      case 'cmd+left':
        this.switchSpace(s.currentSpace - 1);
        return true;
      case 'cmd+right':
        this.switchSpace(s.currentSpace + 1);
        return true;
      case 'cmd+tab':
      case 'cmd+shift+tab':
        this.cycleApp(keys === 'cmd+shift+tab' ? -1 : 1);
        return true;
      case 'cmd+w': {
        const w = this.focusedWindow();
        if (w) this.closeWindow(w.id);
        return true;
      }
      case 'cmd+m':
      case 'cmd+h':
        this.minimizeFocused();
        return true;
      case 'cmd+q': {
        if (s.focusedApp) this.quitApp(s.focusedApp);
        return true;
      }
      case 'cmd+,': {
        this.openApp('settings');
        this.emit({ type: 'settings:open' });
        return true;
      }
      case 'cmd+n': {
        if (s.focusedApp === 'notes') this.newNote();
        else this.openApp(s.focusedApp ?? 'finder');
        return true;
      }
      case 'cmd+c': {
        const name = this.lastSelectedFile ?? 'โน้ตประชุม 9 ต.ค..txt';
        this.store.update((st) => ({ clipboard: [...st.clipboard.slice(-4), name] }));
        this.emit({ type: 'file:copy', name });
        return true;
      }
      case 'cmd+x': {
        const name = this.lastSelectedFile ?? 'โน้ตประชุม 9 ต.ค..txt';
        this.store.update((st) => ({ clipboard: [...st.clipboard.slice(-4), name] }));
        this.emit({ type: 'file:copy', name });
        return true;
      }
      case 'cmd+v': {
        const name = s.clipboard[s.clipboard.length - 1];
        if (name) {
          const src = this.findFile(s.fs, name);
          if (src) {
            const path = this.finderPath();
            createFile(this.store.get().fs, path, `คัดลอกของ ${name}`, src.content ?? '');
          }
        }
        this.emit({ type: 'file:paste', name: name ?? '' });
        return true;
      }
      case 'cmd+delete': {
        if (this.lastSelectedFile) {
          const path = this.finderPath();
          const node = removeNode(this.store.get().fs, path, this.lastSelectedFile);
          if (node) this.store.update((st) => ({ trash: [...st.trash, node] }));
        }
        return true;
      }
      case 'cmd+shift+3': {
        this.flash('📸 บันทึกภาพหน้าจอแล้ว (จำลอง) — ไฟล์จะอยู่บนเดสก์ท็อป');
        return true;
      }
      case 'esc': {
        const o = s.overlays;
        if (o.spotlight) this.closeOverlay('spotlight');
        else if (o.launchpad) this.closeOverlay('launchpad');
        else if (o.missioncontrol) this.closeMissionControl();
        else if (o.controlcenter) this.closeOverlay('controlcenter');
        return true;
      }
      default:
        return false;
    }
  }

  /** path ปัจจุบันของหน้าต่าง Finder ที่โฟกัส (payload ที่ Finder เขียนกลับ) */
  private finderPath(): string[] {
    const s = this.store.get();
    const win = s.windows.find((w) => w.app === 'finder');
    const p = win?.payload?.path as string[] | undefined;
    return p && Array.isArray(p) ? p : ['Users', 'somchai', 'Desktop'];
  }

  private cycleApp(dir: 1 | -1): void {
    const s = this.store.get();
    if (s.runningApps.length < 2) return;
    const idx = s.runningApps.indexOf(s.focusedApp ?? 'finder');
    const next = s.runningApps[(idx + dir + s.runningApps.length) % s.runningApps.length] ?? 'finder';
    this.switcherTarget = next;
    this.setOverlay('appswitcher', true);
    if (this.switcherTimer) clearTimeout(this.switcherTimer);
    this.switcherTimer = window.setTimeout(() => {
      this.setOverlay('appswitcher', false);
      if (next !== 'finder') this.openApp(next);
      else {
        const wins = this.store.get().windows.filter((w) => w.app === 'finder');
        if (wins.length) this.focusWindow(wins[wins.length - 1]!.id);
        else this.openApp('finder');
      }
      this.switcherTarget = null;
    }, 850);
  }

  /** แจ้งเตือนลอยกลางจอ (เช่น screenshot) */
  flash(message: string): void {
    const el = h('div.sim-flash', { text: message });
    this.overlayLayer.appendChild(el);
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, 2200);
  }

  sleep(restart = false): void {
    const el = h(
      'div.sim-sleep',
      restart
        ? [h('div.sleep-text', { text: 'กำลังรีสตาร์ท…' }), h('div.sleep-hint', { text: '(คลิกเพื่อปลุกเครื่อง)' })]
        : [h('div.sleep-lock', { text: '🔒' }), h('div.sleep-hint', { text: 'คลิกเพื่อปลุกหน้าจอ' })],
    );
    el.onclick = () => el.remove();
    this.overlayLayer.appendChild(el);
  }

  private onKeydown = (e: KeyboardEvent): void => {
    if (!this.active) return;
    const key = normalizeKey(e);
    if (!key) return;
    if (key === 'cmd' || key === 'alt' || key === 'shift') return;
    const meta = e.metaKey || e.ctrlKey;
    const parts: string[] = [];
    if (meta) parts.push('cmd');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey) parts.push('shift');
    parts.push(key);
    const combo = parts.join('+');
    if (meta || key === 'f3' || key === 'esc') {
      if (this.performShortcut(combo)) e.preventDefault();
    }
  };
}

export function wallpaperCss(id: string): string {
  return WALLPAPERS.find((w) => w.id === id)?.css ?? '';
}

export function appNameOf(id: string): string {
  return appDisplayName(id);
}

export function pathExists(root: FSNode, path: string[]): boolean {
  return resolvePath(root, path) !== null;
}
