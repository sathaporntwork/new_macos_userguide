/**
 * h() — hyperscript helper สำหรับสร้าง DOM แบบ type-safe
 * h('div.card', { onclick: fn }, h('span', 'สวัสดี'))
 * selector: tag + .class + #id
 */

type Child = Node | string | number | null | undefined | false | Child[];

export interface Attrs {
  className?: string;
  id?: string;
  text?: string;
  html?: string;
  title?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  href?: string;
  src?: string;
  alt?: string;
  htmlFor?: string;
  disabled?: boolean;
  checked?: boolean;
  contentEditable?: boolean;
  spellcheck?: boolean;
  dataset?: Record<string, string>;
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
  ariaLabel?: string;
  role?: string;
  tabIndex?: number;
  [key: string]: unknown; // event handlers: onclick, oninput, ...
}

export function h(selector: string, attrs?: Attrs | Child, ...children: Child[]): HTMLElement {
  // รองรับทั้ง h('div', {onclick}) และ h('div', child, child...)
  if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) {
    children = [attrs as Child, ...children];
    attrs = {};
  }
  const a: Attrs = (attrs as Attrs) ?? {};
  const [tag = 'div', ...classes] = selector.split('.');
  const [tagName, id] = tag.split('#');
  const el = document.createElement(tagName || 'div');
  if (id || a.id) el.id = (id || a.id) as string;
  // class จาก attrs ต้อง "merge" กับ class จาก selector ไม่ใช่แทนที่
  const extraClasses = String(a.className ?? a.class ?? '').split(' ');
  const classList = [...classes, ...extraClasses];
  if (classList.length) el.className = classList.filter(Boolean).join(' ');

  for (const [key, value] of Object.entries(a)) {
    if (value === undefined || value === null || value === false) continue;
    switch (key) {
      case 'className':
      case 'class':
      case 'id':
        break;
      case 'dataset':
        Object.assign(el.dataset, value);
        break;
      case 'style':
        Object.assign(el.style, value);
        break;
      case 'text':
        el.textContent = String(value);
        break;
      case 'html':
        el.innerHTML = String(value);
        break;
      case 'disabled':
        (el as HTMLButtonElement).disabled = true;
        break;
      case 'checked':
        (el as HTMLInputElement).checked = true;
        break;
      case 'contentEditable':
        el.contentEditable = 'true';
        break;
      case 'tabIndex':
        el.tabIndex = Number(value);
        break;
      case 'value':
        (el as HTMLInputElement).value = String(value);
        break;
      default:
        if (key.startsWith('on') && typeof value === 'function') {
          el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
        } else if (key in el) {
          try {
            (el as unknown as Record<string, unknown>)[key] = value;
          } catch {
            el.setAttribute(key, String(value));
          }
        } else {
          el.setAttribute(key, String(value));
        }
    }
  }

  appendChildren(el, children);
  return el;
}

function appendChildren(el: HTMLElement, children: Child[]): void {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (Array.isArray(child)) {
      appendChildren(el, child);
    } else if (child instanceof Node) {
      el.appendChild(child);
    } else {
      el.appendChild(document.createTextNode(String(child)));
    }
  }
}

/** ล้างทุก child ของ element */
export function clear(el: HTMLElement): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}

/** append เฉพาะ child ที่ไม่ว่าง (ข้าม null/undefined/false) */
export function appendAll(el: HTMLElement, ...kids: Child[]): void {
  appendChildren(el, kids);
}

/** สร้าง SVG element จาก string */
export function svg(html: string): SVGSVGElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild as SVGSVGElement;
}
