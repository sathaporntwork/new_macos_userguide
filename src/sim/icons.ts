/** ไอคอนแอปและ glyph ต่าง ๆ ทั้งหมดเป็น inline SVG */

const SQUIRCLE = (fill: string) =>
  `<rect x="2" y="2" width="60" height="60" rx="15" fill="${fill}"/>`;

const defs = (id: string, from: string, to: string, angle = 0) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${angle === 90 ? 0 : 1}" y2="1">
     <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
   </linearGradient>`;

export const ICONS: Record<string, string> = {
  finder: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs('fd', '#4aa8ff', '#0a5bd3')}${defs('fw', '#eaf6ff', '#bfe0ff')}</defs>
    <path d="M32 2C15.4 2 2 15.4 2 32s13.4 30 30 30 30-13.4 30-30S48.6 2 32 2z" fill="url(#fd)"/>
    <path d="M32 2C15.4 2 2 15.4 2 32h30V2z" fill="url(#fw)" opacity="0.92"/>
    <path d="M13 24c0-1 1-2.5 3-2.5s3 1.5 3 2.5" stroke="#1d3b6e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M45 24c0-1 1-2.5 3-2.5s3 1.5 3 2.5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M32 40c3 2.6 6 2.6 9 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0"/>
    <path d="M21 44c4 3.4 11 3.6 15.5 1" stroke="#0c2f5e" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M32 12v40" stroke="#0a4fb8" stroke-width="0" />
  </svg>`,

  launchpad: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs('lp', '#f2f4f8', '#c9ced9')}</defs>
    ${SQUIRCLE('url(#lp)')}
    <g transform="translate(14 14)">
      <rect x="0" y="0" width="8" height="8" rx="2.4" fill="#ff5e5b"/><rect x="14" y="0" width="8" height="8" rx="2.4" fill="#ffb340"/>
      <rect x="28" y="0" width="8" height="8" rx="2.4" fill="#ffd60a"/><rect x="0" y="14" width="8" height="8" rx="2.4" fill="#30d158"/>
      <rect x="14" y="14" width="8" height="8" rx="2.4" fill="#0a84ff"/><rect x="28" y="14" width="8" height="8" rx="2.4" fill="#5e5ce6"/>
      <rect x="0" y="28" width="8" height="8" rx="2.4" fill="#ff375f"/><rect x="14" y="28" width="8" height="8" rx="2.4" fill="#64d2ff"/>
      <rect x="28" y="28" width="8" height="8" rx="2.4" fill="#bf5af2"/>
    </g>
  </svg>`,

  safari: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs('sf', '#e8f4ff', '#b7dcff')}${defs('sr', '#ff5252', '#e02f2f')}</defs>
    ${SQUIRCLE('url(#sf)')}
    <circle cx="32" cy="32" r="24" fill="#fff"/><circle cx="32" cy="32" r="23" fill="none" stroke="#8fbce6" stroke-width="1.4"/>
    <g stroke="#9db8cc" stroke-width="1.2">
      <line x1="32" y1="10" x2="32" y2="15"/><line x1="32" y1="49" x2="32" y2="54"/>
      <line x1="10" y1="32" x2="15" y2="32"/><line x1="49" y1="32" x2="54" y2="32"/>
      <line x1="17" y1="17" x2="20" y2="20"/><line x1="44" y1="44" x2="47" y2="47"/>
      <line x1="47" y1="17" x2="44" y2="20"/><line x1="20" y1="44" x2="17" y2="47"/>
    </g>
    <text x="32" y="13.5" font-size="4.6" fill="#e2402f" text-anchor="middle" font-family="Arial" font-weight="bold">N</text>
    <polygon points="44,20 28,28 20,44 36,36" fill="url(#sr)"/>
    <polygon points="20,44 36,36 30,32" fill="#c62828" opacity="0.75"/>
    <circle cx="32" cy="32" r="1.8" fill="#fff"/>
  </svg>`,

  mail: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs('ml', '#3fa9ff', '#0a63e8')}</defs>
    ${SQUIRCLE('url(#ml)')}
    <rect x="12" y="20" width="40" height="26" rx="5" fill="#fff"/>
    <path d="M14 23l18 13 18-13" fill="none" stroke="#7fb5f2" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  notes: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs('nt', '#fff8d6', '#ffe98a')}</defs>
    ${SQUIRCLE('url(#nt)')}
    <rect x="2" y="2" width="60" height="14" rx="15" fill="#f7c948"/><rect x="2" y="9" width="60" height="7" fill="#f7c948"/>
    <g stroke="#d9b13b" stroke-width="2.4" stroke-linecap="round">
      <line x1="14" y1="27" x2="50" y2="27"/><line x1="14" y1="35" x2="50" y2="35"/><line x1="14" y1="43" x2="42" y2="43"/><line x1="14" y1="51" x2="36" y2="51"/>
    </g>
  </svg>`,

  photos: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs('ph', '#fdfdff', '#e8eaf2')}</defs>
    ${SQUIRCLE('url(#ph)')}
    <g transform="translate(32 32)">
      <ellipse cx="0" cy="-11" rx="6" ry="9" fill="#ffd60a"/>
      <ellipse cx="0" cy="-11" rx="6" ry="9" fill="#ff9f0a" transform="rotate(45)" opacity="0.85"/>
      <ellipse cx="0" cy="-11" rx="6" ry="9" fill="#ff375f" transform="rotate(90)" opacity="0.85"/>
      <ellipse cx="0" cy="-11" rx="6" ry="9" fill="#bf5af2" transform="rotate(135)" opacity="0.85"/>
      <ellipse cx="0" cy="-11" rx="6" ry="9" fill="#0a84ff" transform="rotate(180)" opacity="0.85"/>
      <ellipse cx="0" cy="-11" rx="6" ry="9" fill="#64d2ff" transform="rotate(225)" opacity="0.85"/>
      <ellipse cx="0" cy="-11" rx="6" ry="9" fill="#30d158" transform="rotate(270)" opacity="0.85"/>
      <ellipse cx="0" cy="-11" rx="6" ry="9" fill="#a8e10c" transform="rotate(315)" opacity="0.85"/>
    </g>
  </svg>`,

  calendar: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs('cl', '#ffffff', '#eceef4')}</defs>
    ${SQUIRCLE('url(#cl)')}
    <rect x="2" y="2" width="60" height="16" rx="15" fill="#ff453a"/><rect x="2" y="10" width="60" height="8" fill="#ff453a"/>
    <text x="32" y="52" font-size="30" font-weight="300" fill="#222" text-anchor="middle" font-family="Arial">${new Date().getDate()}</text>
  </svg>`,

  terminal: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs('tm', '#3a3f4d', '#10131c')}</defs>
    ${SQUIRCLE('url(#tm)')}
    <rect x="2" y="2" width="60" height="12" rx="15" fill="#585f70" opacity="0.9"/><rect x="2" y="8" width="60" height="6" fill="#585f70" opacity="0.9"/>
    <path d="M14 26l8 6-8 6" stroke="#7ef29d" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="26" y1="40" x2="40" y2="40" stroke="#e6edf3" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  settings: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs('st', '#9aa1b1', '#5b6270')}</defs>
    ${SQUIRCLE('url(#st)')}
    <g fill="#f4f5f7">
      <path d="M32 12l3.2 5.6a15.5 15.5 0 0 1 5 2.1l6.2-1.8 4 6.9-4.6 4.4a15 15 0 0 1 0 5.6l4.6 4.4-4 6.9-6.2-1.8a15.5 15.5 0 0 1-5 2.1L32 52l-3.2-5.6a15.5 15.5 0 0 1-5-2.1l-6.2 1.8-4-6.9 4.6-4.4a15 15 0 0 1 0-5.6L13.6 24.8l4-6.9 6.2 1.8a15.5 15.5 0 0 1 5-2.1L32 12z"/>
    </g>
    <circle cx="32" cy="32" r="8.5" fill="#636a78"/><circle cx="32" cy="32" r="5" fill="#e9ebf0"/>
  </svg>`,

  appstore: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs('as', '#3fa9ff', '#0a5ae0')}</defs>
    ${SQUIRCLE('url(#as)')}
    <g stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none">
      <path d="M22 42l10-17 10 17"/><path d="M18.5 36h27"/><path d="M26 25.5c-1.6-2.6-4-2.6-5 0L15.5 37"/>
      <path d="M38 25.5c1.6-2.6 4-2.6 5 0l5.5 11"/>
    </g>
  </svg>`,

  activity: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs('ac', '#2c303c', '#14161d')}</defs>
    ${SQUIRCLE('url(#ac)')}
    <path d="M10 38h9l5-12 7 20 6-24 5 16h12" stroke="#30d158" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  music: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs('mu', '#ff6482', '#f4235b')}</defs>
    ${SQUIRCLE('url(#mu)')}
    <path d="M42 14v22.5a7 7 0 1 1-4-6.3V21l-14 3.5V41a7 7 0 1 1-4-6.3V19l22-5z" fill="#fff"/>
  </svg>`,

  trash: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 20l3 34a4 4 0 0 0 4 3.6h14a4 4 0 0 0 4-3.6l3-34" fill="none" stroke="#b9bfd0" stroke-width="3" stroke-linecap="round"/>
    <path d="M24 26l1.6 24M32 26v24M40 26l-1.6 24" stroke="#ccd2e0" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="14" y="14" width="36" height="6" rx="3" fill="#ccd2e0"/>
    <path d="M26 14a6 6 0 0 1 12 0" fill="none" stroke="#ccd2e0" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  'trash-full': `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 20l3 34a4 4 0 0 0 4 3.6h14a4 4 0 0 0 4-3.6l3-34" fill="none" stroke="#b9bfd0" stroke-width="3" stroke-linecap="round"/>
    <path d="M24 26l1.6 24M32 26v24M40 26l-1.6 24" stroke="#ccd2e0" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="14" y="14" width="36" height="6" rx="3" fill="#ccd2e0"/>
    <path d="M26 14a6 6 0 0 1 12 0" fill="none" stroke="#ccd2e0" stroke-width="3" stroke-linecap="round"/>
    <path d="M22 21l7-6 6 4 7-3-4 8H24z" fill="#9aa4bd"/>
  </svg>`,
};

/** ไอคอนโฟลเดอร์ macOS (รองรับสีแท็ก) */
export function folderIcon(color?: string): string {
  const tint = color ?? '#5aa9f8';
  return `<svg viewBox="0 0 64 52" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="fg${tint.slice(1)}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${tint}"/><stop offset="1" stop-color="${shade(tint)}"/>
    </linearGradient></defs>
    <path d="M4 10a4 4 0 0 1 4-4h14l6 6h24a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10z" fill="url(#fg${tint.slice(1)})"/>
    <path d="M4 18h52v4H4z" fill="#ffffff" opacity="0.18"/>
  </svg>`;
}

export function fileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, { bg: string; label: string }> = {
    txt: { bg: '#8e8e93', label: 'TXT' },
    pdf: { bg: '#ff453a', label: 'PDF' },
    jpg: { bg: '#30d158', label: 'JPG' },
    png: { bg: '#30d158', label: 'PNG' },
    dmg: { bg: '#0a84ff', label: 'DMG' },
    xlsx: { bg: '#217346', label: 'XLS' },
    numbers: { bg: '#ff9f0a', label: 'NUM' },
    m4a: { bg: '#ff375f', label: 'M4A' },
    mov: { bg: '#bf5af2', label: 'MOV' },
    pages: { bg: '#ff9f0a', label: 'PGS' },
  };
  const meta = map[ext] ?? { bg: '#8e8e93', label: 'FILE' };
  return `<svg viewBox="0 0 52 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4a4 4 0 0 1 4-4h24l12 12v48a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V4z" fill="#f7f8fb"/>
    <path d="M34 0l12 12H38a4 4 0 0 1-4-4V0z" fill="#d6dbe8"/>
    <rect x="6" y="38" width="40" height="18" rx="4" fill="${meta.bg}"/>
    <text x="26" y="51" font-size="11" font-weight="700" fill="#fff" text-anchor="middle" font-family="Arial">${meta.label}</text>
  </svg>`;
}

function shade(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 255) - 60);
  const g = Math.max(0, ((n >> 8) & 255) - 50);
  const b = Math.max(0, (n & 255) - 30);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export const TAG_COLORS: { id: string; name: string; color: string }[] = [
  { id: 'red', name: 'แดง', color: '#ff5f57' },
  { id: 'orange', name: 'ส้ม', color: '#ff9f0a' },
  { id: 'yellow', name: 'เหลือง', color: '#ffd60a' },
  { id: 'green', name: 'เขียว', color: '#30d158' },
  { id: 'blue', name: 'น้ำเงิน', color: '#0a84ff' },
  { id: 'purple', name: 'ม่วง', color: '#bf5af2' },
  { id: 'pink', name: 'ชมพู', color: '#ff375f' },
];
