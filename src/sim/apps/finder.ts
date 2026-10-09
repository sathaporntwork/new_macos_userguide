/** Finder — ตัวจัดการไฟล์ของ Mac (คู่กับ File Explorer ของ Windows) */

import { h, clear } from '../../core/dom';
import {
  HOME,
  listFolder,
  createFolder,
  removeNode,
  renameNode,
  type FSNode,
} from '../state';
import { folderIcon, fileIcon, TAG_COLORS } from '../icons';
import { openMenu, type MenuItem } from '../menu';
import type { AppDef } from './registry';

interface SideItem {
  id: string;
  label: string;
  glyph: string;
  path: string[] | 'trash' | 'airdrop';
  section: string;
}

const SIDEBAR: SideItem[] = [
  { id: 'airdrop', label: 'AirDrop', glyph: '◎', path: 'airdrop', section: 'รายการโปรด' },
  { id: 'recents', label: 'ใช้ล่าสุด', glyph: '🕘', path: ['__recents'], section: 'รายการโปรด' },
  { id: 'apps', label: 'แอปพลิเคชัน', glyph: '🅰', path: ['Applications'], section: 'รายการโปรด' },
  { id: 'desktop', label: 'เดสก์ท็อป', glyph: '🖥', path: [...HOME, 'Desktop'], section: 'รายการโปรด' },
  { id: 'documents', label: 'เอกสาร', glyph: '📄', path: [...HOME, 'Documents'], section: 'รายการโปรด' },
  { id: 'downloads', label: 'ดาวน์โหลด', glyph: '⬇', path: [...HOME, 'Downloads'], section: 'รายการโปรด' },
  { id: 'pictures', label: 'รูปภาพ', glyph: '🌄', path: [...HOME, 'Pictures'], section: 'รายการโปรด' },
  { id: 'hd', label: 'Macintosh HD', glyph: '💽', path: [], section: 'ตำแหน่ง' },
  { id: 'trash', label: 'ถังขยะ', glyph: '🗑', path: 'trash', section: 'ตำแหน่ง' },
];

function folderLabel(path: string[]): string {
  if (path.length === 0) return 'Macintosh HD';
  return path[path.length - 1] ?? '';
}

function fmtSize(node: FSNode): string {
  if (node.kind === 'folder') return '--';
  const kb = 40 + (node.name.length * 37) % 4200;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export const finderApp: AppDef = {
  id: 'finder',
  name: 'Finder',
  en: 'Finder',
  icon: 'finder',
  dock: true,
  w: 780,
  h: 500,

  render(body, sim, win) {
    let path: string[] | 'trash' | 'airdrop' = win.payload?.trash
      ? 'trash'
      : ((win.payload?.path as string[]) ?? [...HOME]);
    let view: 'icon' | 'list' = 'icon';
    let selected: string | null = null;

    body.classList.add('finder');

    const backStack: (string[] | 'trash' | 'airdrop')[] = [];
    const fwdStack: (string[] | 'trash' | 'airdrop')[] = [];

    const titleEl = h('span.finder-path');
    const contentEl = h('div.finder-content', { dataset: { simTarget: 'finder-content' }, tabindex: '0' });
    const searchEl = h('input.finder-search', {
      type: 'text',
      placeholder: 'ค้นหา',
      dataset: { simTarget: 'finder-search' },
      oninput: () => renderContent(),
    }) as HTMLInputElement;

    const toolbar = h(
      'div.finder-toolbar',
      h('button.nav-btn', {
        dataset: { simTarget: 'finder-back' },
        title: 'ย้อนกลับ',
        html: '‹',
        onclick: () => {
          const prev = backStack.pop();
          if (prev) {
            fwdStack.push(path);
            path = prev;
            navigate(false);
          }
        },
      }),
      h('button.nav-btn', {
        dataset: { simTarget: 'finder-forward' },
        title: 'ไปข้างหน้า',
        html: '›',
        onclick: () => {
          const next = fwdStack.pop();
          if (next) {
            backStack.push(path);
            path = next;
            navigate(false);
          }
        },
      }),
      titleEl,
      h('div.finder-spacer'),
      h(
        'div.seg',
        { dataset: { simTarget: 'finder-viewtoggle' } },
        h('button.seg-btn', {
          dataset: { simTarget: 'finder-view-icon' },
          title: 'มุมมองไอคอน',
          text: '▦',
          onclick: () => setView('icon'),
        }),
        h('button.seg-btn', {
          dataset: { simTarget: 'finder-view-list' },
          title: 'มุมมองรายการ',
          text: '☰',
          onclick: () => setView('list'),
        }),
      ),
      h('button.nav-btn', {
        dataset: { simTarget: 'finder-action' },
        title: 'การทำงานเพิ่มเติม',
        text: '⋮',
        onclick: (e: Event) => {
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const root = sim.root.getBoundingClientRect();
          openMenu(sim, actionItems(), r.left - root.left, r.bottom - root.top + 4);
        },
      }),
      searchEl,
    );

    const sideEl = h('aside.finder-sidebar');
    buildSidebar();

    body.append(h('div.finder-toolbar-wrap', toolbar), h('div.finder-main', sideEl, contentEl));

    function buildSidebar(): void {
      clear(sideEl);
      let section = '';
      for (const item of SIDEBAR) {
        if (item.section !== section) {
          section = item.section;
          sideEl.appendChild(h('div.side-head', { text: section }));
        }
        sideEl.appendChild(
          h(
            'button.side-item',
            {
              dataset: { simTarget: `finder-side:${item.id}` },
              onclick: () => {
                backStack.push(path);
                fwdStack.length = 0;
                path = item.path;
                sim.emit({ type: 'finder:sidebar', item: item.id });
                navigate();
              },
            },
            h('span.side-glyph', { text: item.glyph }),
            h('span', { text: item.label }),
          ),
        );
      }
    }

    function actionItems(): MenuItem[] {
      if (path === 'airdrop') return [{ label: 'ไม่มีรายการ', disabled: true }];
      return [
        {
          label: 'โฟลเดอร์ใหม่',
          shortcut: '⇧⌘N',
          onclick: () => newFolder(),
        },
        { separator: true },
        { label: 'จัดเรียงตามชื่อ', onclick: () => sim.emit({ type: 'finder:sort' }) },
        { label: 'แสดงเป็นไอคอน', onclick: () => setView('icon') },
        { label: 'แสดงเป็นรายการ', onclick: () => setView('list') },
      ];
    }

    function currentItems(): FSNode[] {
      const s = sim.store.get();
      if (path === 'trash') return s.trash;
      if (path === 'airdrop') return [];
      if (path[0] === '__recents') return allFiles(s.fs, []).slice(0, 12).map((r) => r.node);
      const q = searchEl.value.trim().toLowerCase();
      let items = listFolder(s.fs, path as string[]);
      if (q) items = items.filter((i) => i.name.toLowerCase().includes(q));
      return items;
    }

    function allFiles(node: FSNode, prefix: string[]): { node: FSNode; path: string[] }[] {
      const out: { node: FSNode; path: string[] }[] = [];
      for (const c of node.children ?? []) {
        out.push({ node: c, path: prefix });
        if (c.kind === 'folder') out.push(...allFiles(c, [...prefix, c.name]));
      }
      return out;
    }

    function newFolder(): void {
      if (path === 'trash' || path === 'airdrop') return;
      const base = path[0] === '__recents' ? HOME : (path as string[]);
      createFolder(sim.store.get().fs, base, 'โฟลเดอร์ที่ไม่มีชื่อ');
      sim.emit({ type: 'finder:newFolder' });
      renderContent();
    }

    function trashItem(name: string): void {
      if (path === 'trash' || path === 'airdrop') return;
      const base = path[0] === '__recents' ? HOME : (path as string[]);
      const node = removeNode(sim.store.get().fs, base, name);
      if (node) {
        sim.store.update((s) => ({ trash: [...s.trash, node] }));
        sim.emit({ type: 'finder:trash', name });
        renderContent();
      }
    }

    function itemMenu(item: FSNode, cx: number, cy: number): void {
      selected = item.name;
      renderContent();
      const items: MenuItem[] = [
        ...(path === 'trash'
          ? [
              {
                label: 'นำออกจากถังขยะ (กู้คืน)',
                onclick: () => {
                  sim.emit({ type: 'trash:restore', name: item.name });
                  sim.store.update((s) => {
                    const idx = s.trash.findIndex((t) => t.name === item.name);
                    if (idx === -1) return {};
                    const node = s.trash[idx]!;
                    const doc = [...HOME, 'Documents'];
                    const parent = doc.reduce<FSNode | null>(
                      (acc, seg) => acc?.children?.find((c) => c.name === seg) ?? null,
                      s.fs,
                    );
                    parent?.children?.push(node);
                    return { trash: s.trash.filter((_, i) => i !== idx) };
                  });
                  renderContent();
                },
              },
            ]
          : [
              { label: 'เปิด', onclick: () => openItem(item) },
              { separator: true },
              {
                label: 'เปลี่ยนชื่อ',
                onclick: () => startRename(item.name),
              },
              {
                label: 'แท็กสี…',
                onclick: () =>
                  openMenu(
                    sim,
                    TAG_COLORS.map((t) => ({
                      label: t.name,
                      onclick: () => {
                        item.color = t.color;
                        sim.emit({ type: 'finder:color', color: t.id });
                        renderContent();
                      },
                    })),
                    cx,
                    cy,
                  ),
              },
              { separator: true },
              {
                label: 'ย้ายไปถังขยะ',
                shortcut: '⌘⌫',
                danger: true,
                onclick: () => trashItem(item.name),
              },
            ]),
        { separator: true },
        { label: 'รับข้อมูล', shortcut: '⌘I', onclick: () => sim.emit({ type: 'file:info' }) },
      ];
      openMenu(sim, items, cx, cy);
    }

    function startRename(name: string): void {
      const el = contentEl.querySelector<HTMLElement>(`[data-name="${CSS.escape(name)}"] .item-name`);
      if (!el) return;
      const input = h('input.rename-input', { type: 'text', value: name }) as HTMLInputElement;
      clear(el);
      el.appendChild(input);
      input.focus();
      input.select();
      const commit = () => {
        const newName = input.value.trim() || name;
        if (newName !== name) {
          const base = path === 'trash' || path === 'airdrop' ? HOME : path[0] === '__recents' ? HOME : (path as string[]);
          renameNode(sim.store.get().fs, base, name, newName);
          sim.emit({ type: 'finder:rename', name: newName });
        }
        renderContent();
      };
      input.onblur = commit;
      input.onkeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') {
          input.onblur = null;
          renderContent();
        }
        e.stopPropagation();
      };
    }

    function openItem(item: FSNode): void {
      if (path === 'trash' || path === 'airdrop') return;
      if (item.kind === 'folder') {
        const base = path[0] === '__recents' ? [...HOME, ...(path.slice(1))] : (path as string[]);
        backStack.push(path);
        fwdStack.length = 0;
        path = [...base, item.name];
        navigate();
      } else {
        sim.emit({ type: 'file:open', name: item.name });
        sim.quickLook(item);
      }
    }

    function navigate(emit = true): void {
      selected = null;
      searchEl.value = '';
      sim.setSelected(null);
      // เขียน path กลับไปที่ payload เพื่อให้ shortcut (⌘V) รู้ว่า Finder อยู่ที่ไหน
      if (win.payload) win.payload.path = path === 'trash' ? ['__trash'] : path;
      if (path === 'trash') {
        titleEl.textContent = 'ถังขยะ';
      } else if (path === 'airdrop') {
        titleEl.textContent = 'AirDrop';
      } else {
        titleEl.textContent = folderLabel(path[0] === '__recents' ? ['ใช้ล่าสุด'] : (path as string[]));
      }
      if (emit) sim.emit({ type: 'finder:navigate', path: path === 'trash' ? 'ถังขยะ' : path === 'airdrop' ? 'AirDrop' : folderLabel(path as string[]) });
      renderContent();
    }

    function setView(v: 'icon' | 'list'): void {
      view = v;
      sim.emit({ type: 'finder:view', view: v });
      renderContent();
    }

    function renderContent(): void {
      contentEl.classList.toggle('as-list', view === 'list');
      clear(contentEl);
      const items = currentItems();

      if (path === 'airdrop') {
        contentEl.appendChild(
          h('div.finder-empty', h('div', { text: '◎' }), h('p', { text: 'AirDrop ช่วยส่งไฟล์ไปเครื่อง Apple ใกล้เคียงได้ทันที' }), h('p.small', { text: '(โหมดจำลอง — ใช้ได้เฉพาะบนเครื่องจริง)' })),
        );
        return;
      }

      if (items.length === 0) {
        contentEl.appendChild(
          h('div.finder-empty', h('div', { text: path === 'trash' ? '🗑' : '📂' }), h('p', { text: path === 'trash' ? 'ถังขยะว่างเปล่า' : 'โฟลเดอร์นี้ว่างเปล่า' })),
        );
      } else if (view === 'icon') {
        contentEl.appendChild(
          h(
            'div.finder-grid',
            ...items.map((item) =>
              h(
                'div.finder-item',
                {
                  dataset: { name: item.name, simTarget: item.kind === 'folder' ? 'finder-item:folder' : 'finder-item:file' },
                  class: selected === item.name ? 'selected' : '',
                  onclick: () => {
                    selected = item.name;
                    sim.setSelected(item.name);
                    sim.emit({ type: 'finder:select', name: item.name });
                    renderContent();
                  },
                  ondblclick: () => openItem(item),
                  oncontextmenu: (e: MouseEvent) => {
                    e.preventDefault();
                    const r = sim.root.getBoundingClientRect();
                    itemMenu(item, e.clientX - r.left, e.clientY - r.top);
                  },
                },
                h('div.item-icon', {
                  html: item.kind === 'folder' ? folderIcon(item.color) : fileIcon(item.name),
                  class: item.color && item.kind === 'folder' ? 'tagged' : '',
                }),
                h('div.item-name', { text: item.name }),
              ),
            ),
          ),
        );
      } else {
        contentEl.appendChild(
          h(
            'table.finder-list',
            h(
              'thead',
              h(
                'tr',
                h('th', { text: 'ชื่อ' }),
                h('th', { text: 'วันที่แก้ไข' }),
                h('th', { text: 'ขนาด' }),
                h('th', { text: 'ประเภท' }),
              ),
            ),
            h(
              'tbody',
              ...items.map((item) =>
                h(
                  'tr',
                  {
                    dataset: { name: item.name },
                    class: selected === item.name ? 'selected' : '',
                    onclick: () => {
                      selected = item.name;
                      sim.setSelected(item.name);
                      sim.emit({ type: 'finder:select', name: item.name });
                      renderContent();
                    },
                    ondblclick: () => openItem(item),
                    oncontextmenu: (e: MouseEvent) => {
                      e.preventDefault();
                      const r = sim.root.getBoundingClientRect();
                      itemMenu(item, e.clientX - r.left, e.clientY - r.top);
                    },
                  },
                  h('td', h('span.mini-icon', { html: item.kind === 'folder' ? folderIcon(item.color) : fileIcon(item.name) }), item.name),
                  h('td', { text: item.modified ?? 'วันนี้' }),
                  h('td', { text: fmtSize(item) }),
                  h('td', { text: item.kind === 'folder' ? 'โฟลเดอร์' : `เอกสาร ${item.name.split('.').pop()?.toUpperCase()}` }),
                ),
              ),
            ),
          ),
        );
      }

      // พื้นที่ว่าง: คลิกขวาสร้างโฟลเดอร์ใหม่
      contentEl.oncontextmenu = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest('.finder-item, .finder-list')) return;
        e.preventDefault();
        if (path === 'trash') return;
        const r = sim.root.getBoundingClientRect();
        openMenu(
          sim,
          [
            { label: 'โฟลเดอร์ใหม่', shortcut: '⇧⌘N', onclick: () => newFolder() },
            { separator: true },
            { label: 'จัดเรียงตามชื่อ', onclick: () => sim.emit({ type: 'finder:sort' }) },
            { label: 'แสดงข้อมูลโฟลเดอร์', onclick: () => sim.emit({ type: 'file:info' }) },
          ],
          e.clientX - r.left,
          e.clientY - r.top,
        );
      };
    }

    // เรนเดอร์ใหม่เมื่อ trash เปลี่ยน (เช่น ล้างถังขยะจาก dock)
    const unsub = sim.store.subscribe(() => {
      if (path === 'trash') renderContent();
    });
    body.addEventListener('simdestroy', unsub, { once: true });

    if ((win.payload?.view as 'icon' | 'list') === 'list') view = 'list';
    navigate(false);
  },
};
