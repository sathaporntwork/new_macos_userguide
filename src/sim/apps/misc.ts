/** แอปเสริม: About This Mac, Activity Monitor, Mail, Photos, Calendar, App Store */

import { h } from '../../core/dom';
import { WALLPAPERS } from '../state';
import type { AppDef } from './registry';

export const aboutApp: AppDef = {
  id: 'about',
  name: 'เกี่ยวกับเครื่องนี้',
  en: 'About This Mac',
  icon: 'settings',
  w: 420,
  h: 440,
  render(body) {
    body.classList.add('about');
    body.append(
      h('div.about-hero', h('div.about-laptop', { html: '💻' })),
      h('h2.about-name', { text: 'MacBook Pro 16"' }),
      h('p.about-sub', { text: 'ต้นปี 2569' }),
      h(
        'table.about-table',
        h('tr', h('td', { text: 'ชิป' }), h('td', { text: 'Apple M4 Pro' })),
        h('tr', h('td', { text: 'หน่วยความจำ' }), h('td', { text: '24 GB' })),
        h('tr', h('td', { text: 'สตาร์ทอัปดิสก์' }), h('td', { text: 'Macintosh HD' })),
        h('tr', h('td', { text: 'หมายเลขซีเรียล' }), h('td', { text: 'C02XP•••••TH' })),
        h('tr', h('td', { text: 'macOS' }), h('td', { text: 'Tahoe 26.0.1 (25A362)' })),
      ),
      h('div.about-btns', h('button.btn-small', { text: 'ข้อมูลเพิ่มเติม…' }), h('button.btn-small', { text: 'รายงานระบบ…' })),
    );
  },
};

export const activityApp: AppDef = {
  id: 'activity',
  name: 'Activity Monitor',
  en: 'Activity Monitor',
  icon: 'activity',
  w: 700,
  h: 440,
  menus: (sim) => [
    {
      title: 'Activity Monitor',
      items: [{ label: 'เลิกทำงาน', shortcut: '⌘Q', onclick: () => sim.quitApp('activity') }],
    },
  ],
  render(body) {
    body.classList.add('activity');
    const procs = [
      { name: 'WindowServer', cpu: 12.4 },
      { name: 'Safari', cpu: 8.2 },
      { name: 'Finder', cpu: 1.1 },
      { name: 'Spotlight', cpu: 0.7 },
      { name: 'โน้ต', cpu: 0.3 },
      { name: 'kernel_task', cpu: 5.6 },
      { name: 'Dock', cpu: 0.9 },
      { name: 'M4 Pro GPU', cpu: 3.3 },
    ];
    body.append(
      h(
        'div.act-tabs',
        h('button.act-tab active', { text: 'CPU' }),
        h('button.act-tab', { text: 'หน่วยความจำ' }),
        h('button.act-tab', { text: 'พลังงาน' }),
        h('button.act-tab', { text: 'ดิสก์' }),
        h('button.act-tab', { text: 'เครือข่าย' }),
      ),
      h(
        'table.act-table',
        h('thead', h('tr', h('th', { text: 'ชื่อกระบวนการ' }), h('th', { text: '% CPU' }), h('th', { text: 'เธรด' }), h('th', { text: 'PID' }))),
        h(
          'tbody',
          ...procs.map((p, i) =>
            h(
              'tr',
              h('td', { text: p.name }),
              h('td', { text: p.cpu.toFixed(1) }),
              h('td', { text: String(2 + ((i * 7) % 14)) }),
              h('td', { text: String(400 + i * 137) }),
            ),
          ),
        ),
      ),
      h('p.act-note', {
        html: '💡 เทียบกับ Windows: นี่คือ "Task Manager" ของ Mac — ถ้าแอปค้าง ให้กดโลโก้แอปเปิ้ล (Apple menu ซ้ายบน) → Force Quit แทน Ctrl+Alt+Delete',
      }),
    );
  },
};

export const mailApp: AppDef = {
  id: 'mail',
  name: 'เมล',
  en: 'Mail',
  icon: 'mail',
  dock: true,
  w: 720,
  h: 480,
  render(body) {
    body.classList.add('mail');
    const mails = [
      { from: 'Apple', subj: 'ยินดีต้อนรับสู่ Mac ใหม่ของคุณ 🎉', time: '09:41' },
      { from: 'ทีมงาน', subj: 'สรุปประชุมวันจันทร์', time: '08:15' },
      { from: 'GitHub', subj: '[macpath-26] Your deploy succeeded', time: 'เมื่อวาน' },
      { from: 'ธนาคาร', subj: 'ยอดเงินเดือนนี้พร้อมแล้ว', time: 'เมื่อวาน' },
      { from: 'คุณป้า', subj: 'สู้ ๆ นะลูก ❤️', time: '2 วัน' },
    ];
    body.append(
      h(
        'div.mail-side',
        h('div.mail-box active', { text: '📥 กล่องจดหมาย' }),
        h('div.mail-box', { text: '📤 ฉันได้ส่ง' }),
        h('div.mail-box', { text: '📝 ฉันกำลังเขียน' }),
        h('div.mail-box', { text: '🗑 ถังขยะ' }),
      ),
      h(
        'div.mail-list',
        ...mails.map((m, i) =>
          h(
            'div.mail-item',
            { class: i === 0 ? 'unread' : '' },
            h('div.mail-from', { text: m.from }),
            h('div.mail-subj', { text: m.subj }),
            h('div.mail-time', { text: m.time }),
          ),
        ),
      ),
    );
  },
};

export const photosApp: AppDef = {
  id: 'photos',
  name: 'รูปภาพ',
  en: 'Photos',
  icon: 'photos',
  dock: true,
  w: 720,
  h: 480,
  render(body) {
    body.classList.add('photos');
    const grads = [
      'linear-gradient(135deg,#ff9a9e,#fecfef)',
      'linear-gradient(135deg,#a1c4fd,#c2e9fb)',
      'linear-gradient(135deg,#fddb92,#d1fdff)',
      'linear-gradient(135deg,#84fab0,#8fd3f4)',
      'linear-gradient(135deg,#fbc2eb,#a6c1ee)',
      'linear-gradient(135deg,#fdcbf1,#e6dee9)',
      'linear-gradient(135deg,#a18cd1,#fbc2eb)',
      'linear-gradient(135deg,#ffecd2,#fcb69f)',
      'linear-gradient(135deg,#5ee7df,#b490ca)',
    ];
    body.append(h('div.photos-head', { text: 'คลังรูปภาพ — 9 รายการ' }), h('div.photos-grid', ...grads.map((g) => h('div.photo-tile', { style: { background: g } }))));
  },
};

export const calendarApp: AppDef = {
  id: 'calendar',
  name: 'ปฏิทิน',
  en: 'Calendar',
  icon: 'calendar',
  dock: true,
  w: 680,
  h: 480,
  render(body) {
    body.classList.add('calendar');
    const now = new Date();
    const year = now.getFullYear() + 543;
    const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const cells: (number | null)[] = [...Array(first % 7).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
    body.append(
      h('div.cal-head', h('b', { text: `ตุลาคม ${year}` }), h('span', { text: '← →' })),
      h(
        'div.cal-grid',
        ...['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((d) => h('div.cal-dow', { text: d })),
        ...cells.map((d) =>
          h('div.cal-day', { class: d === now.getDate() ? 'today' : '' }, d ? h('span', { text: String(d) }) : null),
        ),
      ),
    );
  }
};

export const appstoreApp: AppDef = {
  id: 'appstore',
  name: 'App Store',
  en: 'App Store',
  icon: 'appstore',
  dock: false,
  w: 700,
  h: 480,
  render(body, sim) {
    body.classList.add('appstore');
    const featured = [
      { name: 'PixelPaint', desc: 'วาดรูปง่าย ๆ สไตล์ Mac', grad: 'linear-gradient(135deg,#667eea,#764ba2)' },
      { name: 'QuickNotes Pro', desc: 'โน้ตฉลาดพร้อม AI ช่วยเรียบเรียง', grad: 'linear-gradient(135deg,#f093fb,#f5576c)' },
      { name: 'FileFly', desc: 'ย้ายไฟล์จาก Windows เร็ว ๆ', grad: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
    ];
    body.append(
      h('h2.as-head', { text: 'ค้นพบ' }),
      h(
        'div.as-grid',
        ...featured.map((f) =>
          h(
            'div.as-card',
            h('div.as-icon', { style: { background: f.grad }, text: f.name.slice(0, 1) }),
            h('div', h('b', { text: f.name }), h('p', { text: f.desc })),
            h('button.btn-small', { text: 'รับ', onclick: () => sim.emit({ type: 'menu:click', menu: 'App Store', item: `รับ ${f.name}` }) }),
          ),
        ),
      ),
      h('p.act-note', {
        html: '💡 ในเครื่องจริง: ติดตั้งแอปจาก App Store = กด "รับ" จบ ส่วนแอปนอก App Store จะได้ไฟล์ .dmg ให้ลากไปโฟลเดอร์ Applications (สอนในโมดูล 5)',
      }),
    );
  },
};

export const wallpaperPreview = (id: string): string => WALLPAPERS.find((w) => w.id === id)?.css ?? '';
