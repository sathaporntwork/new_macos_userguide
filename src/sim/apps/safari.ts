/** Safari — เบราว์เซอร์จำลองพร้อมหน้าเว็บตัวอย่าง */

import { h, clear } from '../../core/dom';
import type { AppDef } from './registry';


interface FakePage {
  url: string;
  title: string;
  render(): HTMLElement;
}

const PAGES: FakePage[] = [
  {
    url: 'apple.com/th/macos',
    title: 'macOS Tahoe — Apple (TH)',
    render: () =>
      h(
        'div.webpage.apple-page',
        h('h1', { text: 'macOS Tahoe 26' }),
        h('p.lead', { text: 'ระบบปฏิบัติการ Mac ที่ออกแบบใหม่ทั้งหมดด้วย Liquid Glass — ใส เนียน และสวยขึ้นในทุกมุมมอง' }),
        h(
          'ul.page-points',
          h('li', { text: '✨ Liquid Glass — วัสดุกระจกใสที่ปรับตามพื้นหลัง' }),
          h('li', { text: '🔍 Spotlight ใหม่ — ค้นหา ส่งอีเมล ดูคลิปบอร์ด ได้ในที่เดียว' }),
          h('li', { text: '📞 แอปโทรศัพท์บน Mac — รับ/โทรต่อจาก iPhone' }),
          h('li', { text: '🤖 Apple Intelligence — ช่วยเขียน แปล สรุป อัตโนมัติ' }),
        ),
        h('p.small', { text: '(หน้าจำลองเพื่อการเรียน — apple.com/th/macos)' }),
      ),
  },
  {
    url: 'support.apple.com/th-th',
    title: 'การสนับสนุนของ Apple (TH)',
    render: () =>
      h(
        'div.webpage',
        h('h1', { text: 'การสนับสนุนของ Apple' }),
        h('p.lead', { text: 'คู่มือผู้ใช้ macOS และเคล็ดลับสำหรับมือใหม่' }),
        h(
          'ul.page-points',
          h('li', { text: '📘 คู่มือผู้ใช้ macOS Tahoe' }),
          h('li', { text: '⌨️ คีย์ลัดที่ควรรู้สำหรับผู้ย้ายจาก Windows' }),
          h('li', { text: '🔄 ย้ายข้อมูลจาก PC ไป Mac ด้วย Migration Assistant' }),
        ),
        h('p.small', { text: '(หน้าจำลองเพื่อการเรียน)' }),
      ),
  },
  {
    url: 'macpath.local/tips',
    title: 'เคล็ดลับ Mac สำหรับสาย Windows',
    render: () =>
      h(
        'div.webpage',
        h('h1', { text: 'เคล็ดลับเร็ว ๆ' }),
        h('ul.page-points', h('li', { text: '⌘ ใน Mac = Ctrl ใน Windows' }),
          h('li', { text: 'ปิดหน้าต่าง ≠ ออกจากโปรแกรม — ต้อง ⌘Q' }),
          h('li', { text: 'Spotlight (⌘Space) = เปิดอะไรก็ได้โดยไม่ต้องเอามือไปแตะเมาส์' }),
        ),
      ),
  },
];

export const safariApp: AppDef = {
  id: 'safari',
  name: 'Safari',
  en: 'Safari',
  icon: 'safari',
  dock: true,
  w: 820,
  h: 540,

  menus: (sim) => [
    {
      title: 'ไฟล์',
      items: [{ label: 'หน้าต่างใหม่', shortcut: '⌘N', onclick: () => sim.openApp('safari') }],
    },
    {
      title: 'บุ๊กมาร์ก',
      items: [
        { label: 'เพิ่มบุ๊กมาร์ก', shortcut: '⌘D', onclick: () => sim.emit({ type: 'safari:bookmark' }) },
      ],
    },
  ],

  render(body, sim) {
    body.classList.add('safari');
    let current = '';
    const back: string[] = [];
    const fwd: string[] = [];

    const addr = h('input.addr', {
      type: 'text',
      placeholder: 'ค้นหาหรือป้อนชื่อเว็บไซต์',
      dataset: { simTarget: 'safari-address' },
    }) as HTMLInputElement;
    const viewport = h('div.safari-viewport', { dataset: { simTarget: 'safari-page' } });

    const bookmarks = h(
      'div.safari-bookmarks',
      { dataset: { simTarget: 'safari-bookmarks' } },
      ...PAGES.map((p) =>
        h('button.bm', { text: `★ ${p.title}`, onclick: () => go(p.url, true) }),
      ),
    );

    body.append(
      h(
        'div.safari-toolbar',
        h('button.nav-btn', { html: '‹', dataset: { simTarget: 'safari-back' }, onclick: () => {
          const prev = back.pop();
          if (prev) { fwd.push(current); go(prev, false); }
        } }),
        h('button.nav-btn', { html: '›', onclick: () => {
          const next = fwd.pop();
          if (next) { back.push(current); go(next, false); }
        } }),
        addr,
        h('button.nav-btn', { html: '⟳', title: 'รีโหลด', onclick: () => go(current || PAGES[0]!.url, false) }),
      ),
      bookmarks,
      viewport,
    );

    addr.onkeydown = (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        let url = addr.value.trim().toLowerCase();
        if (!url) return;
        if (!url.includes('.')) url = 'macpath.local/tips';
        go(url, true);
      }
    };

    function go(url: string, push: boolean): void {
      if (push && current && current !== url) back.push(current);
      current = url;
      addr.value = url;
      sim.emit({ type: 'safari:navigate', url });
      renderPage();
    }

    function renderPage(): void {
      clear(viewport);
      const page = PAGES.find((p) => p.url === current);
      if (page) {
        viewport.appendChild(page.render());
      } else {
        viewport.appendChild(
          h(
            'div.webpage',
            h('h1', { text: '🔍 ไม่พบหน้าเว็บนี้' }),
            h('p.lead', { text: `Safari จำลองไม่สามารถเปิด "${current}" ได้ — ลองกดบุ๊กมาร์กด้านบน` }),
          ),
        );
      }
    }

    go(PAGES[0]!.url, false);
  },
};
