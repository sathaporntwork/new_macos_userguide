/** จุดเริ่มต้นของแอป — เชื่อม router เข้ากับ views */

import './styles/base.css';
import './styles/sim.css';
import './styles/apps.css';

import { h, clear } from './core/dom';
import { initTheme } from './core/theme';
import { onRouteChange, parseHash, navigate } from './app/router';
import { renderNavbar } from './app/components/navbar';
import { renderHome } from './app/views/home';
import { renderModulePage } from './app/views/modulePage';
import { renderLessonView, type LessonViewHandle } from './app/views/lesson';
import { renderPlayground } from './app/views/playground';
import { renderAchievements } from './app/views/achievements';
import { trainerLesson } from './engine/trainer';
import { registerDoneCheck } from './curriculum';
import { loadProgress } from './engine/progress';

registerDoneCheck((id) => Boolean(loadProgress().lessons[id]?.completed));
initTheme();

const app = document.getElementById('app')!;
let currentHandle: LessonViewHandle | null = null;

function render(): void {
  const route = parseHash();
  currentHandle?.destroy();
  currentHandle = null;
  clear(app);

  const navbar = renderNavbar(route);
  const page = h('main.page');
  app.append(navbar, page);

  switch (route.view) {
    case 'home':
      renderHome(page);
      break;
    case 'module':
      renderModulePage(page, route.param ?? '');
      break;
    case 'lesson': {
      if (route.param === 'trainer') {
        currentHandle = renderLessonView(page, '', trainerLesson()) ?? null;
      } else {
        currentHandle = renderLessonView(page, route.param ?? '') ?? null;
      }
      break;
    }
    case 'playground': {
      const pg = renderPlayground(page);
      currentHandle = { destroy: pg.destroy };
      break;
    }
    case 'trainer': {
      currentHandle = renderLessonView(page, '', trainerLesson()) ?? null;
      break;
    }
    case 'achievements':
      renderAchievements(page);
      break;
  }

  window.scrollTo({ top: 0 });
}

onRouteChange(render);
render();

// ถ้าเข้ามาครั้งแรกโดยไม่มี hash ตั้งเป็น / เพื่อความสม่ำเสมอ
if (!location.hash) navigate('/');
void h;
