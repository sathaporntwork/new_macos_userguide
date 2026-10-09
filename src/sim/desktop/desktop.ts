/** Desktop — wallpaper, ไอคอนบนเดสก์ท็อป, เมนูคลิกขวา */

import { h, clear } from '../../core/dom';
import { HOME, listFolder, WALLPAPERS } from '../state';
import { folderIcon, fileIcon } from '../icons';
import { openMenu } from '../menu';
import type { Simulator } from '../simulator';

export class Desktop {
  el: HTMLElement;

  constructor(private sim: Simulator) {
    this.el = h('div.sim-desktop', { dataset: { simTarget: 'desktop' } });
    this.render();
    this.sim.store.subscribe(() => this.sync());
  }

  private sync(): void {
    const s = this.sim.store.get();
    this.el.style.background = WALLPAPERS.find((w) => w.id === s.wallpaper)?.css ?? '';
    // ไอคอนเดสก์ท็อปเปลี่ยนเมื่อไฟล์ Desktop เปลี่ยน — เรนเดอร์ใหม่เร็ว ๆ
    this.renderIcons();
  }

  private render(): void {
    this.el.style.background = WALLPAPERS.find((w) => w.id === this.sim.store.get().wallpaper)?.css ?? '';
    const iconsEl = h('div.desk-icons', { dataset: { simTarget: 'desktop-icons' } });
    iconsEl.id = 'desk-icons';
    this.el.appendChild(iconsEl);
    this.renderIcons();

    this.el.oncontextmenu = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.desk-icon, .sim-window')) return;
      e.preventDefault();
      const r = this.sim.root.getBoundingClientRect();
      this.sim.emit({ type: 'desktop:contextmenu' });
      openMenu(
        this.sim,
        [
          {
            label: 'โฟลเดอร์ใหม่',
            onclick: () => {
              this.sim.openApp('finder', { path: [...HOME, 'Desktop'] });
              this.sim.emit({ type: 'finder:newFolder' });
            },
          },
          { separator: true },
          {
            label: 'เปลี่ยนภาพพื้นหลัง…',
            onclick: () => this.sim.openApp('settings', { pane: 'wallpaper' }),
          },
          { label: 'ใช้ Stacks จัดระเบียบ', onclick: () => {} },
        ],
        e.clientX - r.left,
        e.clientY - r.top,
      );
    };
  }

  private renderIcons(): void {
    const iconsEl = this.el.querySelector('#desk-icons');
    if (!iconsEl) return;
    clear(iconsEl as HTMLElement);
    const items = listFolder(this.sim.store.get().fs, [...HOME, 'Desktop']);
    for (const item of items) {
      (iconsEl as HTMLElement).appendChild(
        h(
          'button.desk-icon',
          {
            dataset: { simTarget: `desktop-icon:${item.name}` },
            title: item.name,
            ondblclick: () => this.sim.quickLook(item),
          },
          h('div.desk-icon-img', { html: item.kind === 'folder' ? folderIcon(item.color) : fileIcon(item.name) }),
          h('span.desk-icon-name', { text: item.name }),
        ),
      );
    }
  }
}
