/** แถบนำทางด้านบนของเว็บ พร้อมระดับและ XP */

import { h } from '../../core/dom';
import { currentTheme, toggleTheme } from '../../core/theme';
import { levelInfo, loadProgress } from '../../engine/progress';
import type { Route } from '../router';

const LINKS: { path: string; label: string }[] = [
  { path: '/', label: 'หน้าแรก' },
  { path: '/trainer', label: 'สนามฝึกคีย์ลัด' },
  { path: '/playground', label: 'สนามซ้อม' },
  { path: '/achievements', label: 'ความสำเร็จ' },
];

function themeButton(): HTMLElement {
  const btn = h('button.theme-toggle', {
    title: 'สลับธีมมืด/สว่าง',
    ariaLabel: 'สลับธีมมืด/สว่าง',
    text: currentTheme() === 'dark' ? '☀️' : '🌙',
    onclick: () => {
      const next = toggleTheme();
      btn.textContent = next === 'dark' ? '☀️' : '🌙';
    },
  });
  return btn;
}

export function renderNavbar(current: Route): HTMLElement {
  const p = loadProgress();
  const lvl = levelInfo(p.xp);

  return h(
    'nav.navbar',
    h(
      'a.nav-logo',
      { href: '#/' },
      h('span.nav-logo-icon', { html: '<svg viewBox="0 0 14 17" width="15" height="18"><path fill="currentColor" d="M11.6 9.1c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7C3.4 4.5 2 5.3 1.3 6.6c-1.4 2.5-.4 6.2 1 8.2.7 1 1.5 2.1 2.6 2 1 0 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.7 1.1 0 1.8-1 2.5-2 .8-1.2 1.1-2.3 1.1-2.4 0 0-2.2-.9-2.3-3.3zM9.6 2.8C10.2 2.1 10.6 1.1 10.5 0c-.9 0-2 .6-2.6 1.3-.6.6-1 1.7-.9 2.6 1 .1 2-.5 2.6-1.1z"/></svg>' }),
      h('span.nav-logo-text', { html: 'MacPath <b>26</b>' }),
    ),
    h(
      'div.nav-links',
      ...LINKS.map((l) =>
        h('a.nav-link', {
          href: `#${l.path}`,
          text: l.label,
          class: isActive(current, l.path) ? 'active' : '',
        }),
      ),
    ),
    themeButton(),
    h(
      'div.nav-level',
      { title: `ระดับ: ${lvl.name} • ${p.xp} XP` },
      h('span.nav-level-emoji', { text: lvl.emoji }),
      h(
        'div.nav-level-info',
        h('b', { text: lvl.name }),
        h('div.nav-level-bar', h('div.nav-level-fill', { style: { width: `${Math.round(lvl.progress * 100)}%` } })),
      ),
      h('span.nav-xp', { text: `${p.xp} XP` }),
    ),
  );
}

function isActive(route: Route, path: string): boolean {
  if (path === '/') return route.view === 'home';
  return `/${route.view}` === path;
}
