/** Hash-based router เข้ากันได้กับ GitHub Pages */

export interface Route {
  view: 'home' | 'module' | 'lesson' | 'playground' | 'trainer' | 'achievements';
  param?: string;
}

export function parseHash(): Route {
  const hash = location.hash.replace(/^#\/?/, '');
  const [head, param] = hash.split('/');
  switch (head) {
    case 'module':
      return { view: 'module', param };
    case 'lesson':
      return { view: 'lesson', param };
    case 'playground':
      return { view: 'playground' };
    case 'trainer':
      return { view: 'trainer' };
    case 'achievements':
      return { view: 'achievements' };
    default:
      return { view: 'home' };
  }
}

export function navigate(path: string): void {
  location.hash = path.startsWith('/') ? path : `/${path}`;
}

export function onRouteChange(cb: (route: Route) => void): () => void {
  const handler = () => cb(parseHash());
  window.addEventListener('hashchange', handler);
  return () => window.removeEventListener('hashchange', handler);
}
