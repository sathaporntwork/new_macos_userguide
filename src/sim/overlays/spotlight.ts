/** Spotlight — ค้นหาอเนกประสงค์ของ macOS (เวอร์ชันใหม่ใน Tahoe รองรับคลิปบอร์ด + แอคชัน) */

import { h, clear } from '../../core/dom';
import { searchFS, appDisplayName } from '../state';
import { folderIcon, fileIcon } from '../icons';
import type { Simulator } from '../simulator';
import type { FSNode } from '../state';

interface Result {
  kind: 'app' | 'file' | 'calc' | 'clipboard' | 'action';
  title: string;
  sub: string;
  icon: string;
  value: string;
}

/** คำนวณเลขอย่างปลอดภัย (เฉพาะตัวเลข + operator) */
export function safeCalc(expr: string): number | null {
  if (!/^[\d\s+\-*/.()%^]+$/.test(expr) || !/\d/.test(expr)) return null;
  try {
    const js = expr.replace(/\^/g, '**');
    // eslint-disable-next-line no-new-func
    const fn = new Function(`"use strict"; return (${js})`) as () => unknown;
    const v = fn();
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

export function renderSpotlight(sim: Simulator): HTMLElement {
  const el = h('div.overlay-spotlight', { dataset: { simTarget: 'spotlight-panel' } });
  const input = h('input.spot-input', {
    dataset: { simTarget: 'spotlight-input' },
    type: 'text',
    placeholder: 'ค้นหาแอป ไฟล์ คำนวณเลข หรือดูคลิปบอร์ด…',
    spellcheck: false,
  }) as HTMLInputElement;
  const results = h('div.spot-results', { dataset: { simTarget: 'spotlight-results' } });
  const clipHint = h(
    'div.spot-clipboard-row',
    { dataset: { simTarget: 'spotlight-clipboard' }, onclick: () => openClipboard() },
    h('span', { text: '📋' }),
    h('div', h('b', { text: 'คลิปบอร์ด (Clipboard History)' }), h('div.spot-dim', { text: 'ฟีเจอร์ใหม่ใน Tahoe — กดเพื่อดูรายการที่คัดลอกล่าสุด' })),
  );

  let sel = 0;
  let current: Result[] = [];

  el.append(input, clipHint, results);

  function compute(q: string): Result[] {
    const out: Result[] = [];
    const s = sim.store.get();
    const query = q.trim().toLowerCase();

    // เครื่องคิดเลข
    const calc = safeCalc(q.trim());
    if (calc !== null) {
      out.push({ kind: 'calc', title: String(calc), sub: `${q.trim()} — เครื่องคิดเลข`, icon: '🟰', value: String(calc) });
    }

    // แอป
    for (const app of Object.values(sim.apps)) {
      if (!app.dock && app.id !== 'activity' && app.id !== 'appstore') continue;
      const hit = app.en.toLowerCase().includes(query) || app.name.includes(q.trim());
      if (query && hit) {
        out.push({ kind: 'app', title: app.name, sub: `แอปพลิเคชัน — ${app.en}`, icon: '🚀', value: app.id });
      }
    }

    // ไฟล์
    if (query.length >= 2) {
      for (const r of searchFS(s.fs, query)) {
        out.push({
          kind: 'file',
          title: r.node.name,
          sub: '~/' + r.path.join('/'),
          icon: '📄',
          value: r.node.name,
        });
      }
    }

    // แอคชันด่วน (ฟีเจอร์ Tahoe)
    if (query.includes('โน้ต') || query.includes('note')) {
      out.push({ kind: 'action', title: 'สร้างโน้ตใหม่', sub: 'แอคชันด่วน — เปิดโดยไม่ต้องเปิดแอปโน้ต', icon: '⚡', value: 'note' });
    }
    return out.slice(0, 9);
  }

  function openClipboard(): void {
    sim.emit({ type: 'spotlight:clipboard' });
    const s = sim.store.get();
    clear(results);
    results.appendChild(h('div.spot-group-title', { text: 'คลิปบอร์ดล่าสุด' }));
    if (s.clipboard.length === 0) {
      results.appendChild(h('div.spot-item', h('span.spot-dim', { text: 'ยังไม่มีรายการ — ลองเลือกไฟล์/ข้อความแล้วกด ⌘C ดู' })));
    }
    for (const c of s.clipboard) {
      results.appendChild(h('div.spot-item', h('span', { text: '📋' }), h('span', { text: c })));
    }
    sim.emit({ type: 'spotlight:openResult', kind: 'clipboard', value: 'history' });
  }

  function render(q: string): void {
    clear(results);
    current = compute(q);
    sel = 0;
    current.forEach((r, i) => {
      results.appendChild(
        h(
          'div.spot-item',
          {
            class: i === sel ? 'sel' : '',
            dataset: { simTarget: 'spotlight-item' },
            onclick: () => activate(r),
          },
          h('span.spot-icon', { text: r.kind === 'file' ? '' : r.icon, html: r.kind === 'file' ? fileIcon(r.title) : undefined }),
          h('div', h('b', { text: r.title }), h('div.spot-dim', { text: r.sub })),
        ),
      );
    });
    if (q.trim() && current.length === 0) {
      results.appendChild(h('div.spot-item', h('span.spot-dim', { text: 'ไม่พบผลลัพธ์ — ลองคำอื่น' })));
    }
    sim.emit({ type: 'spotlight:search', query: q });
  }

  function activate(r: Result): void {
    sim.emit({ type: 'spotlight:openResult', kind: r.kind, value: r.value });
    if (r.kind === 'app') sim.openApp(r.value);
    if (r.kind === 'action' && r.value === 'note') sim.newNote();
    if (r.kind === 'file') sim.quickLookByName(r.value);
    sim.closeOverlay('spotlight');
  }

  input.oninput = () => render(input.value);
  input.onkeydown = (e) => {
    e.stopPropagation();
    if (e.key === 'ArrowDown') {
      sel = Math.min(sel + 1, current.length - 1);
      render(input.value);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      sel = Math.max(sel - 1, 0);
      render(input.value);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      const r = current[sel];
      if (r) activate(r);
    } else if (e.key === 'Escape') {
      sim.closeOverlay('spotlight');
    }
  };

  setTimeout(() => input.focus(), 30);
  render('');
  return el;
}

export function fileIconFor(node: FSNode): string {
  return node.kind === 'folder' ? folderIcon(node.color) : fileIcon(node.name);
}

export function appName(id: string): string {
  return appDisplayName(id);
}
