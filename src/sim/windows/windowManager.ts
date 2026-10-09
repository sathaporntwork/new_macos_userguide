/** Window Manager — จัดการหน้าต่าง: ลาก, ย่อ, ขยาย, ปิด, focus, z-order */

import { h } from '../../core/dom';
import { clamp } from '../../core/utils';
import type { Rect, SimStore, WindowState } from '../state';
import type { Simulator } from '../simulator';

const MENUBAR_H = 28;

export class WindowManager {
  private layer: HTMLElement;
  private els = new Map<string, HTMLElement>();

  constructor(private sim: Simulator, private store: SimStore) {
    this.layer = h('div.sim-windows');
    this.store.subscribe(() => this.sync());
    this.sync(); // sync ครั้งแรกสำหรับหน้าต่างที่ seed มากับ initial state
  }

  get element(): HTMLElement {
    return this.layer;
  }

  private sync(): void {
    const { windows } = this.store.get();
    const ids = new Set(windows.map((w) => w.id));

    // ลบหน้าต่างที่ปิดแล้ว
    for (const [id, el] of this.els) {
      if (!ids.has(id)) {
        el.classList.add('win-closing');
        setTimeout(() => el.remove(), 160);
        el.dispatchEvent(new CustomEvent('simdestroy', { bubbles: true }));
        this.els.delete(id);
      }
    }

    for (const w of windows) {
      let el = this.els.get(w.id);
      if (!el) {
        el = this.createWindow(w);
        this.els.set(w.id, el);
        this.layer.appendChild(el);
        requestAnimationFrame(() => el!.classList.add('win-open'));
      }
      this.applyRect(el, w);
      el.classList.toggle('minimized', w.minimized);
      el.classList.toggle('focused', this.isFocused(w));
      el.classList.toggle('zoomed', w.zoomed);
    }
  }

  private isFocused(w: WindowState): boolean {
    const s = this.store.get();
    return s.focusedApp === w.app && !w.minimized && w.space === s.currentSpace;
  }

  private applyRect(el: HTMLElement, w: WindowState): void {
    if (w.zoomed) {
      const desk = this.sim.root.getBoundingClientRect();
      Object.assign(el.style, {
        left: '0px',
        top: `${MENUBAR_H}px`,
        width: `${desk.width}px`,
        height: `${desk.height - MENUBAR_H}px`,
        zIndex: String(w.z),
      });
    } else {
      Object.assign(el.style, {
        left: `${w.x}px`,
        top: `${w.y}px`,
        width: `${w.w}px`,
        height: `${w.h}px`,
        zIndex: String(w.z),
      });
    }
  }

  private createWindow(w: WindowState): HTMLElement {
    const el = h('div.sim-window', {
      dataset: { simTarget: `win:${w.app}`, windowId: w.id },
      onpointerdown: () => this.sim.focusWindow(w.id),
      role: 'dialog',
      ariaLabel: w.title,
    });

    const titlebar = h(
      'div.win-titlebar',
      { dataset: { simTarget: 'titlebar' }, onpointerdown: (e: PointerEvent) => this.startDrag(e, w.id) },
      h(
        'div.traffic',
        {},
        h('button.tl.red', {
          dataset: { simTarget: 'traffic:close' },
          title: 'ปิดหน้าต่าง',
          onclick: (e: Event) => {
            e.stopPropagation();
            this.sim.closeWindow(w.id);
          },
        }),
        h('button.tl.yellow', {
          dataset: { simTarget: 'traffic:min' },
          title: 'ย่อไปที่ Dock (กด Option ค้างแล้วคลิก = ย่อทุกหน้าต่างของแอปนี้)',
          onclick: (e: Event) => {
            e.stopPropagation();
            if ((e as MouseEvent).altKey) this.sim.minimizeAppAll(w.app);
            else this.sim.minimizeWindow(w.id);
          },
        }),
        h('button.tl.green', {
          dataset: { simTarget: 'traffic:zoom' },
          title: 'ขยายเต็มจอ',
          onclick: (e: Event) => {
            e.stopPropagation();
            this.sim.zoomWindow(w.id);
          },
        }),
      ),
      h('div.win-title', { text: w.title }),
    );

    const body = h('div.win-body');
    el.append(titlebar, body);

    if (!w.zoomed) {
      el.appendChild(
        h('div.win-resize', {
          title: 'ลากเพื่อปรับขนาด',
          onpointerdown: (e: PointerEvent) => this.startResize(e, w.id),
        }),
      );
    }

    // เรนเดอร์เนื้อหาแอป
    const app = this.sim.apps[w.app];
    if (app) app.render(body, this.sim, w);

    return el;
  }

  private startDrag(e: PointerEvent, winId: string): void {
    const s = this.store.get();
    const win = s.windows.find((w) => w.id === winId);
    if (!win || win.zoomed || e.button !== 0) return;
    const target = e.currentTarget as HTMLElement;
    if ((e.target as HTMLElement).closest('.tl')) return;

    const desk = this.sim.root.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = win.x;
    const origY = win.y;
    let moved = false;
    target.setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      const w = Math.min(desk.width, win.w);
      this.store.update((st) => ({
        windows: st.windows.map((x) =>
          x.id === winId
            ? {
                ...x,
                x: clamp(origX + dx, -w + 120, desk.width - 120),
                y: clamp(origY + dy, MENUBAR_H, desk.height - 60),
              }
            : x,
        ),
      }));
    };
    const onUp = () => {
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
      if (moved) this.sim.emit({ type: 'window:drag', app: win.app });
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
  }

  private startResize(e: PointerEvent, winId: string): void {
    e.stopPropagation();
    const s = this.store.get();
    const win = s.windows.find((w) => w.id === winId);
    if (!win) return;
    const target = e.currentTarget as HTMLElement;
    const startX = e.clientX;
    const startY = e.clientY;
    target.setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      this.store.update((st) => ({
        windows: st.windows.map((x) =>
          x.id === winId
            ? {
                ...x,
                w: clamp(win.w + ev.clientX - startX, 380, 2200),
                h: clamp(win.h + ev.clientY - startY, 240, 1400),
              }
            : x,
        ),
      }));
    };
    const onUp = () => {
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
      this.sim.emit({ type: 'window:resize', app: win.app });
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
  }

  /** ตำแหน่ง cascade สำหรับหน้าต่างใหม่ */
  static cascade(index: number, baseW: number, baseH: number, deskW: number, deskH: number): Rect {
    const offset = (index % 6) * 28;
    const w = Math.min(baseW, deskW - 40);
    const h = Math.min(baseH, deskH - 100);
    const x = Math.max(16, (deskW - w) / 2 - 60 + offset);
    const y = MENUBAR_H + 24 + offset;
    return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
  }
}
