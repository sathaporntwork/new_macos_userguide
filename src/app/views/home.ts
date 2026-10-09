/** หน้าแรก — hero, ความคืบหน้า, รายการโมดูล, ตารางเทียบ Windows ↔ Mac */

import { h } from '../../core/dom';
import { MODULES, TOTAL_LESSONS, TOTAL_MINUTES, TOTAL_XP, lessonDone } from '../../curriculum';
import { levelInfo, loadProgress, stats } from '../../engine/progress';
import { navigate } from '../router';

const WIN_MAC: { topic: string; win: string; mac: string }[] = [
  { topic: 'คีย์หลัก', win: 'Ctrl (Ctrl+C, Ctrl+V)', mac: '⌘ Command (⌘C, ⌘V)' },
  { topic: 'เมนูระบบ', win: 'Start button', mac: 'Apple menu (โลโก้ซ้ายบน)' },
  { topic: 'แถบโปรแกรม', win: 'Taskbar', mac: 'Dock' },
  { topic: 'จัดการไฟล์', win: 'File Explorer (Win+E)', mac: 'Finder' },
  { topic: 'ค้นหา', win: 'Win+S / Win แล้วพิมพ์', mac: 'Spotlight (⌘Space)' },
  { topic: 'ปิดแอป', win: '❌ = ปิดโปรแกรม', mac: 'จุดแดง = ปิดหน้าต่าง / ⌘Q = ออกโปรแกรม' },
  { topic: 'ถังขยะ', win: 'Recycle Bin', mac: 'Trash (มุมขวา Dock)' },
  { topic: 'ตั้งค่าระบบ', win: 'Control Panel / Settings', mac: 'System Settings ( )' },
  { topic: 'Task Manager', win: 'Ctrl+Alt+Delete', mac: 'Activity Monitor / ⌥⌘Esc' },
  { topic: 'ติดตั้งแอป', win: 'ไฟล์ .exe แบบ Next Next', mac: 'App Store หรือ .dmg แล้วลากวาง' },
  { topic: 'ถ่ายหน้าจอ', win: 'Win+Shift+S', mac: '⌘⇧3 (ทั้งจอ) / ⌘⇧4 (เลือกพื้นที่)' },
  { topic: 'สลับแอป', win: 'Alt+Tab', mac: '⌘Tab' },
];

export function renderHome(container: HTMLElement): void {
  const p = loadProgress();
  const lvl = levelInfo(p.xp);
  const st = stats(TOTAL_LESSONS);

  const hero = h(
    'section.hero',
    h(
      'div.hero-inner',
      h(
        'div.hero-copy',
        h('span.hero-kicker', { text: 'macOS Tahoe 26 • สำหรับคนย้ายจาก Windows' }),
        h('h1', { html: 'จากมือใหม่<br><em>สู่ Pro User</em> ใน 7 โมดูล' }),
        h('p.hero-sub', {
          text: `เรียนแบบลงมือทำบน "Mac จำลอง" ที่ใช้ได้จริงในเบราว์เซอร์ — ทีละขั้น มีระบบตรวจให้อัตโนมัติ รวม ${TOTAL_LESSONS} บทเรียน ${Math.round(TOTAL_MINUTES / 6) / 10} ชั่วโมง`,
        }),
        h(
          'div.hero-btns',
          h('button.btn primary big', { text: st.done ? '▶ เรียนต่อ' : '▶ เริ่มบทเรียนแรก', onclick: () => navigate('/lesson/m1l1') }),
          h('button.btn ghost big', { text: 'เข้าสนามซ้อมฟรี', onclick: () => navigate('/playground') }),
        ),
        h('div.hero-stats', [
          h('div.hstat', h('b', { text: String(TOTAL_LESSONS) }), h('span', { text: 'บทเรียน' })),
          h('div.hstat', h('b', { text: '7' }), h('span', { text: 'โมดูล' })),
          h('div.hstat', h('b', { text: `${TOTAL_XP}` }), h('span', { text: 'XP สะสมได้' })),
          h('div.hstat', h('b', { text: '100%' }), h('span', { text: 'ฟรี ไม่ต้องลงทะเบียน' })),
        ]),
      ),
      h(
        'div.hero-card',
        h('div.hero-mac', [
          h('div.hero-mac-menubar', { text: '🍎 Finder ไฟล์ Edit มุมมอง        📶 🔋 อ. 9 ต.ค. 09:41' }),
          h('div.hero-mac-desktop', [
            h('div.hero-mac-window', { text: 'Finder' }),
            h('div.hero-mac-dock', ['   ', '🚀', '🧭', '📧', '📝', '⚙️'].map((e) => h('span', { text: e }))),
          ]),
        ]),
        h('p.hero-mac-cap', { text: '↑ นี่คือ simulator ที่คุณจะได้ลงมือทำจริง' }),
      ),
    ),
  );

  const progressCard = h(
    'section.progress-band',
    h(
      'div.pb-inner',
      h(
        'div.pb-level',
        h('span.pb-emoji', { text: lvl.emoji }),
        h(
          'div',
          h('b', { text: lvl.name }),
          h('div.pb-bar', h('div.pb-fill', { style: { width: `${Math.round(lvl.progress * 100)}%` } })),
          h('span.pb-next', { text: lvl.isMax ? 'ระดับสูงสุดแล้ว — สุดยอด!' : `${p.xp}/${lvl.next} XP สู่ระดับถัดไป` }),
        ),
      ),
      h(
        'div.pb-stats',
        h('div.pb-stat', h('b', { text: `${st.done}/${TOTAL_LESSONS}` }), h('span', { text: 'บทเรียนจบแล้ว' })),
        h('div.pb-stat', h('b', { text: `${st.percent}%` }), h('span', { text: 'ความคืบหน้า' })),
        h('div.pb-stat', h('b', { text: `${p.badges.length}` }), h('span', { text: 'ตราที่ได้รับ' })),
      ),
    ),
  );

  const modulesGrid = h(
    'section.modules',
    h('h2.section-title', { text: '🗺️ เส้นทางสู่ความเป็นโปร' }),
    h(
      'div.module-grid',
      ...MODULES.map((m) => {
        const done = m.lessons.filter((l) => lessonDone(l.id)).length;
        const total = m.lessons.length;
        const complete = done === total;
        return h(
          'a.module-card',
          { href: `#/module/${m.id}` },
          h('div.module-icon', { style: { background: m.color }, text: m.icon }),
          h('div.module-body', [
            h('div.module-num', { text: `โมดูล ${m.number}` }),
            h('h3', { text: m.title }),
            h('p', { text: m.subtitle }),
            h(
              'div.module-foot',
              h(
                'div.module-bar',
                h('div.module-fill', { style: { width: `${Math.round((done / total) * 100)}%` } }),
              ),
              h('span.module-count', { text: complete ? '✓ จบแล้ว' : `${done}/${total} บท` }),
            ),
          ]),
          complete ? h('span.module-done', { text: '✓' }) : null,
        );
      }),
    ),
  );

  const compare = h(
    'section.compare',
    h('h2.section-title', { text: '🔀 แปลงพจนานุกรม Windows → Mac' }),
    h('p.section-sub', { text: 'จำตารางนี้ได้ = ย้ายค่ายสำเร็จ 80% (กลับมาดูได้ตลอด)' }),
    h(
      'div.compare-table',
      h(
        'div.cmp-head',
        h('span', { text: 'หัวข้อ' }),
        h('span.win', { text: '🪟 Windows' }),
        h('span.mac', { text: ' Mac' }),
      ),
      ...WIN_MAC.map((r) =>
        h('div.cmp-row', h('b', { text: r.topic }), h('span.win', { text: r.win }), h('span.mac', { text: r.mac })),
      ),
    ),
  );

  container.append(hero, progressCard, modulesGrid, compare);
}
