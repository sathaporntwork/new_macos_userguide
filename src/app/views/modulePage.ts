/** หน้าโมดูล — รายการบทเรียนในโมดูล */

import { h } from '../../core/dom';
import { findModule, lessonDone } from '../../curriculum';
import { loadProgress } from '../../engine/progress';
import { navigate } from '../router';

export function renderModulePage(container: HTMLElement, moduleId: string): void {
  const m = findModule(moduleId);
  if (!m) {
    navigate('/');
    return;
  }
  const p = loadProgress();
  const done = m.lessons.filter((l) => lessonDone(l.id)).length;

  container.innerHTML = '';
  container.append(
    h(
      'div.modulepage',
      h(
        'a.backline',
        { href: '#/' },
        '‹ กลับหน้าแรก',
      ),
      h(
        'header.module-head',
        h('div.module-hero', { style: { background: m.color } }, h('span', { text: m.icon })),
        h(
          'div.module-head-body',
          h('span.module-num', { text: `โมดูล ${m.number} จาก 7` }),
          h('h1', { text: m.title }),
          h('p', { text: m.subtitle }),
          h(
            'div.module-meta',
            h('span', { text: `📚 ${m.lessons.length} บทเรียน` }),
            h('span', { text: `⏱ ${m.lessons.reduce((s, l) => s + l.minutes, 0)} นาที` }),
            h('span', { text: `${done}/${m.lessons.length} จบแล้ว` }),
          ),
          h(
            'div.module-badges',
            h(
              'span.badge-chip',
              { class: p.badges.includes(m.badge.id) ? 'got' : '' },
              `${m.badge.emoji} ${m.badge.name}${p.badges.includes(m.badge.id) ? ' ✓' : ''}`,
            ),
          ),
        ),
      ),
      h(
        'ol.lesson-list',
        ...m.lessons.map((l, i) => {
          const isDone = lessonDone(l.id);
          const prevDone = i === 0 || lessonDone(m.lessons[i - 1]!.id);
          return h(
            'li',
            h(
              'button.lesson-row',
              {
                class: isDone ? 'done' : prevDone ? 'ready' : 'locked',
                onclick: () => navigate(`/lesson/${l.id}`),
              },
              h('span.lesson-idx', { text: isDone ? '✓' : String(i + 1) }),
              h(
                'div.lesson-row-body',
                h('b', { text: l.title }),
                h('span', { text: l.goal }),
              ),
              h('span.lesson-row-meta', { text: `⏱ ${l.minutes} นาที • +${l.xp} XP` }),
              h('span.lesson-row-go', { text: isDone ? 'ทบทวน ›' : prevDone ? 'เริ่มเรียน ›' : '🔒' }),
            ),
          );
        }),
      ),
    ),
  );
}
