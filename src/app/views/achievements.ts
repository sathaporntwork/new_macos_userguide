/** หน้าความสำเร็จ — ระดับ, ตรา, สถิติ และประกาศนียบัตร */

import { h, clear } from '../../core/dom';
import { MODULES, TOTAL_LESSONS, lessonDone, moduleComplete } from '../../curriculum';
import { levelInfo, loadProgress, resetProgress, LEVELS } from '../../engine/progress';
import { TRAINER_BADGE } from '../../engine/trainer';
import { navigate } from '../router';

export function renderAchievements(container: HTMLElement): void {
  const p = loadProgress();
  const lvl = levelInfo(p.xp);
  const done = Array.from({ length: TOTAL_LESSONS }).filter((_, i) => lessonDone(MODULES.flatMap((m) => m.lessons)[i]?.id ?? '')).length;

  container.innerHTML = '';

  const levelCard = h(
    'section.ach-level',
    h('div.ring', { style: { '--p': String(Math.round(lvl.progress * 100)) } }, h('span.ring-emoji', { text: lvl.emoji }), h('b.ring-pct', { text: lvl.isMax ? 'MAX' : `${Math.round(lvl.progress * 100)}%` })),
    h(
      'div.ach-level-body',
      h('span.ach-kicker', { text: 'ระดับปัจจุบัน' }),
      h('h1', { text: `${lvl.emoji} ${lvl.name}` }),
      h('p', { text: lvl.isMax ? `สูงสุดแล้วด้วย ${p.xp} XP — สุดยอดแห่ง Pro User!` : `${p.xp} XP • ต้องการอีก ${Math.max(0, (lvl.next ?? 0) - p.xp)} XP เพื่อระดับถัดไป` }),
      h(
        'div.ach-levelbar',
        ...LEVELS.map((L) =>
          h('div.ach-lvl-step', { class: p.xp >= L.xp ? 'reached' : '' }, h('span', { text: L.emoji }), h('small', { text: L.name })),
        ),
      ),
    ),
  );

  const badgeList = [
    ...MODULES.map((m) => m.badge),
    { id: 'badge:first', name: 'ก้าวแรกบนโลก Mac', emoji: '👣', desc: 'จบบทเรียนแรกสำเร็จ' },
    { id: 'badge:pro', name: 'Mac Pro User', emoji: '🏆', desc: 'จบครบทั้ง 7 โมดูล — รับประกาศนียบัตร' },
    TRAINER_BADGE,
  ];
  const got = new Set(p.badges);

  const badgesGrid = h(
    'section.ach-badges',
    h('h2.section-title', { text: '🎖️ คอลเลกชันตรา' }),
    h(
      'div.badge-grid',
      ...badgeList.map((b) =>
        h(
          'div.badge-card',
          { class: got.has(b.id) ? 'got' : '' },
          h('span.badge-emoji', { text: got.has(b.id) ? b.emoji : '🔒' }),
          h('b', { text: b.name }),
          h('p', { text: b.desc }),
        ),
      ),
    ),
  );

  const modulesSection = h(
    'section.ach-modules',
    h('h2.section-title', { text: '📊 ความคืบหน้ารายโมดูล' }),
    ...MODULES.map((m) => {
      const d = m.lessons.filter((l) => lessonDone(l.id)).length;
      return h(
        'div.ach-modrow',
        h('span.ach-modicon', { style: { background: m.color }, text: m.icon }),
        h('b', { text: `โมดูล ${m.number}: ${m.title}` }),
        h('div.ach-modbar', h('div', { style: { width: `${(d / m.lessons.length) * 100}%` } })),
        h(
          'button.ach-modbtn',
          { onclick: () => navigate(`/module/${m.id}`) },
          textDone(d, m.lessons.length),
        ),
      );
    }),
  );

  const certDone = MODULES.every((m) => moduleComplete(m));
  const cert = h(
    'section.ach-cert',
    h('h2.section-title', { text: certDone ? '📜 ประกาศนียบัตร' : '📜 ประกาศนียบัตร (ล็อกอยู่)' }),
    certDone
      ? h(
          'div.cert',
          h('div.cert-inner', [
            h('span.cert-logo', { text: '🍎' }),
            h('small', { text: 'MacPath 26 — หลักสูตร macOS Tahoe สำหรับผู้ย้ายจาก Windows' }),
            h('h1', { text: 'ประกาศนียบัตร Pro User' }),
            h('p', { text: 'มอบให้แก่' }),
            h('input.cert-name', { type: 'text', placeholder: 'พิมพ์ชื่อของคุณ', 'aria-label': 'ชื่อผู้รับ' }),
            h('p.cert-desc', { text: 'ผ่านการฝึกทั้ง 7 โมดูล ครบถ้วน ทั้งการใช้ Finder, คีย์ลัด, Spotlight, System Settings, Mission Control และ Terminal' }),
            h('div.cert-foot', h('span', { text: `ออกให้ ณ วันที่ ${new Date().toLocaleDateString('th-TH')}` }), h('b', { text: `${p.xp} XP` })),
            h('button.btn primary', { text: '🖨 พิมพ์/บันทึก PDF', onclick: () => window.print() }),
          ]),
        )
      : h('p.section-sub', { text: 'จบบทเรียนครบทั้ง 7 โมดูลเพื่อปลดล็อกประกาศนียบัตร — เหลืออีก ' + `${TOTAL_LESSONS - done} บทเรียน` }),
  );

  const danger = h(
    'section.ach-danger',
    h('button.btn ghost', {
      text: '🗑 รีเซ็ตความคืบหน้าทั้งหมด',
      onclick: () => {
        if (confirm('ลบความคืบหน้าทั้งหมดจริงหรือไม่? (XP, ตรา และสถานะบทเรียนจะหายหมด)')) {
          resetProgress();
          renderAchievements(container);
        }
      },
    }),
  );

  container.append(levelCard, badgesGrid, modulesSection, cert, danger);
  void clear;
}

function textDone(d: number, total: number): string {
  return d === total ? '✓ จบแล้ว' : `${d}/${total}`;
}
