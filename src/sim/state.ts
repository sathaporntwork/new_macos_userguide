/** State ของ macOS simulator — filesystem, หน้าต่าง, การตั้งค่า, แอปต่าง ๆ */

import { Store } from '../core/store';

// ---------- Filesystem ----------

export interface FSNode {
  name: string;
  kind: 'folder' | 'file';
  /** สีแท็กของโฟลเดอร์ (ฟีเจอร์ใหม่ใน Tahoe) */
  color?: string;
  /** เนื้อหาไฟล์ข้อความ */
  content?: string;
  /** วันที่แก้ไขล่าสุด */
  modified?: string;
  children?: FSNode[];
}

export function resolvePath(root: FSNode, path: string[]): FSNode | null {
  let node: FSNode = root;
  for (const seg of path) {
    if (node.kind !== 'folder' || !node.children) return null;
    const next = node.children.find((c) => c.name === seg);
    if (!next) return null;
    node = next;
  }
  return node;
}

export function listFolder(root: FSNode, path: string[]): FSNode[] {
  const node = resolvePath(root, path);
  if (!node || node.kind !== 'folder') return [];
  return [...(node.children ?? [])].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name, 'th');
  });
}

export function createFolder(root: FSNode, path: string[], name: string): boolean {
  const parent = resolvePath(root, path);
  if (!parent || parent.kind !== 'folder') return false;
  parent.children = parent.children ?? [];
  let finalName = name;
  let i = 2;
  while (parent.children.some((c) => c.name === finalName)) {
    finalName = `${name} ${i}`;
    i++;
  }
  parent.children.push({ name: finalName, kind: 'folder', children: [], modified: today() });
  return true;
}

export function createFile(root: FSNode, path: string[], name: string, content = ''): boolean {
  const parent = resolvePath(root, path);
  if (!parent || parent.kind !== 'folder') return false;
  parent.children = parent.children ?? [];
  if (parent.children.some((c) => c.name === name)) return false;
  parent.children.push({ name, kind: 'file', content, modified: today() });
  return true;
}

export function removeNode(root: FSNode, path: string[], name: string): FSNode | null {
  const parent = resolvePath(root, path);
  if (!parent || parent.kind !== 'folder' || !parent.children) return null;
  const idx = parent.children.findIndex((c) => c.name === name);
  if (idx === -1) return null;
  return parent.children.splice(idx, 1)[0] ?? null;
}

export function renameNode(root: FSNode, path: string[], oldName: string, newName: string): boolean {
  const node = resolvePath(root, [...path, oldName]);
  if (!node) return false;
  node.name = newName;
  node.modified = today();
  return true;
}

export function searchFS(root: FSNode, query: string): { node: FSNode; path: string[] }[] {
  const results: { node: FSNode; path: string[] }[] = [];
  const q = query.toLowerCase();
  const walk = (node: FSNode, path: string[]) => {
    for (const child of node.children ?? []) {
      if (child.name.toLowerCase().includes(q)) results.push({ node: child, path });
      if (child.kind === 'folder') walk(child, [...path, child.name]);
    }
  };
  walk(root, []);
  return results.slice(0, 8);
}

function today(): string {
  return new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ---------- หน้าต่าง ----------

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WindowState extends Rect {
  id: string;
  app: string;
  title: string;
  z: number;
  minimized: boolean;
  zoomed: boolean;
  prevRect?: Rect;
  /** space ที่หน้าต่างอยู่ */
  space: number;
  /** payload เฉพาะแอป เช่น path เริ่มต้นของ Finder */
  payload?: Record<string, unknown>;
}

// ---------- State หลัก ----------

export interface NoteItem {
  id: string;
  title: string;
  body: string;
  modified: string;
}

export interface SimState {
  wallpaper: string;
  appearance: 'light' | 'dark';
  accent: string;
  dockSize: number;
  magnification: boolean;
  naturalScroll: boolean;
  stageManager: boolean;
  spaces: string[]; // ชื่อ desktop
  currentSpace: number;
  windows: WindowState[];
  zCounter: number;
  runningApps: string[];
  focusedApp: string | null;
  clipboard: string[];
  wifi: boolean;
  bluetooth: boolean;
  dnd: boolean;
  fs: FSNode; // root "Macintosh HD"
  trash: FSNode[];
  notes: NoteItem[];
  hotCorners: Record<string, string>;
  overlays: {
    spotlight: boolean;
    launchpad: boolean;
    missioncontrol: boolean;
    controlcenter: boolean;
    appswitcher: boolean;
  };
}

export const WALLPAPERS: { id: string; name: string; css: string }[] = [
  {
    id: 'tahoe-blue',
    name: 'Tahoe Blue',
    css: 'radial-gradient(120% 140% at 20% 10%, #6ee7ff 0%, transparent 45%), radial-gradient(130% 120% at 85% 20%, #0a84ff 0%, transparent 55%), radial-gradient(140% 130% at 50% 100%, #5e5ce6 0%, transparent 60%), linear-gradient(160deg, #03254c 0%, #1160b7 55%, #6fb6ff 100%)',
  },
  {
    id: 'sunset',
    name: 'ซันเซ็ต',
    css: 'radial-gradient(110% 130% at 15% 15%, #ffd166 0%, transparent 45%), radial-gradient(130% 120% at 85% 30%, #ff5e5b 0%, transparent 50%), linear-gradient(165deg, #3d0e61 0%, #b23a86 55%, #ff9e6d 100%)',
  },
  {
    id: 'sequoia',
    name: 'เซควอยา',
    css: 'radial-gradient(120% 130% at 25% 10%, #9ff5c9 0%, transparent 45%), radial-gradient(130% 120% at 80% 25%, #0eb58b 0%, transparent 50%), linear-gradient(160deg, #03372c 0%, #0a6e4f 60%, #35c48d 100%)',
  },
  {
    id: 'graphite',
    name: 'กราไฟต์',
    css: 'radial-gradient(120% 140% at 30% 0%, #5f6579 0%, transparent 50%), radial-gradient(130% 130% at 80% 90%, #2c3140 0%, transparent 60%), linear-gradient(160deg, #0d0f16 0%, #232735 60%, #4a5063 100%)',
  },
  {
    id: 'aurora',
    name: 'ออโรรา',
    css: 'radial-gradient(100% 120% at 10% 20%, #7cf5d4 0%, transparent 40%), radial-gradient(110% 120% at 90% 10%, #b892ff 0%, transparent 45%), radial-gradient(120% 140% at 50% 100%, #ff7ad9 0%, transparent 55%), linear-gradient(155deg, #071630 0%, #14306b 60%, #3e6ff0 100%)',
  },
];

export const ACCENTS: { id: string; name: string; color: string }[] = [
  { id: 'blue', name: 'น้ำเงิน', color: '#0a84ff' },
  { id: 'purple', name: 'ม่วง', color: '#bf5af2' },
  { id: 'pink', name: 'ชมพู', color: '#ff375f' },
  { id: 'orange', name: 'ส้ม', color: '#ff9f0a' },
  { id: 'green', name: 'เขียว', color: '#30d158' },
  { id: 'graphite', name: 'กราไฟต์', color: '#8e8e93' },
];

export const HOME = ['Users', 'somchai'];

function file(name: string, content = '', modified?: string): FSNode {
  return { name, kind: 'file', content, modified: modified ?? '12 ก.ย. 2568' };
}

function folder(name: string, children: FSNode[] = [], color?: string): FSNode {
  return { name, kind: 'folder', children, color };
}

export function defaultFS(): FSNode {
  return folder('Macintosh HD', [
    folder('Applications'),
    folder('Library'),
    folder('System'),
    folder('Users', [
      folder('somchai', [
        folder('Desktop', [
          file('สรุปงานประจำสัปดาห์.txt', 'ส่งรายงานทีมวันศุกร์\nเช็กอีเมลลูกค้า\nอัปเดตสไลด์ประชุม'),
          file('รูปบ้านใหม่.jpg', '[ไฟล์รูปภาพ]'),
          folder('โปรเจกต์ใหม่'),
        ]),
        folder('Documents', [
          file('ใบเสร็จค่าไฟ.pdf', '[เอกสาร PDF]'),
          file('โน้ตประชุม 9 ต.ค..txt', 'ประชุมทีม 10:00\n- รีวิว roadmap Q4\n- ย้ายเครื่องจาก Windows ไป Mac'),
          file('แผนงบประมาณ 2569.numbers', '[ไฟล์ Numbers]'),
          folder('ใบงานเก่าสมัย Windows', [file('เกรดมหาลัย.xlsx', '[ไฟล์ Excel]')]),
        ]),
        folder('Downloads', [file('PixelPaint-Setup.dmg', '[ดิสก์อิมเมจ]'), file('ปุปป้ายราคาสินค้า.pdf', '[เอกสาร PDF]')]),
        folder('Pictures', [file('ทะเลหัวหิน.jpg', '[ไฟล์รูปภาพ]'), file('ถ่ายบ่ายวันเกิด.jpg', '[ไฟล์รูปภาพ]')]),
        folder('Music', [file('เพลงประกอบงาน.m4a', '[ไฟล์เสียง]')]),
        folder('Movies', [file('คลิปทริปเกาหลี.mov', '[ไฟล์วิดีโอ]')]),
        folder('Public'),
      ]),
    ]),
  ]);
}

export function defaultNotes(): NoteItem[] {
  return [
    {
      id: 'n1',
      title: 'สิ่งที่ต้องทำหลังย้ายมา Mac',
      body: '1. ตั้งค่า Touch ID\n2. ซ้อมคีย์ลัด ⌘C / ⌘V\n3. ย้ายไฟล์จาก external drive\n4. ลอง Spotlight ค้นหาทุกอย่าง',
      modified: '9 ต.ค. 2569',
    },
    {
      id: 'n2',
      title: 'รายการซื้อของเข้าบ้าน',
      body: '• กาแฟดริป\n• นมโรลได้ 2 ลัง\n• สบู่เหลว',
      modified: '8 ต.ค. 2569',
    },
  ];
}

export function defaultState(): SimState {
  return {
    wallpaper: 'tahoe-blue',
    appearance: 'light',
    accent: 'blue',
    dockSize: 1,
    magnification: true,
    naturalScroll: true,
    stageManager: false,
    spaces: ['Desktop 1'],
    currentSpace: 0,
    windows: [],
    zCounter: 1,
    runningApps: ['finder'],
    focusedApp: null,
    clipboard: [],
    wifi: true,
    bluetooth: true,
    dnd: false,
    fs: defaultFS(),
    trash: [],
    notes: defaultNotes(),
    hotCorners: { tl: '-', tr: '-', bl: '-', br: '-' },
    overlays: {
      spotlight: false,
      launchpad: false,
      missioncontrol: false,
      controlcenter: false,
      appswitcher: false,
    },
  };
}

export type SimStore = Store<SimState>;

export function appDisplayName(id: string): string {
  const map: Record<string, string> = {
    finder: 'Finder',
    launchpad: 'Launchpad',
    safari: 'Safari',
    mail: 'Mail',
    notes: 'โน้ต',
    photos: 'รูปภาพ',
    calendar: 'ปฏิทิน',
    terminal: 'เทอร์มินัล',
    settings: 'การตั้งค่าระบบ',
    trash: 'ถังขยะ',
    appstore: 'App Store',
    activity: 'Activity Monitor',
    about: 'เกี่ยวกับเครื่องนี้',
  };
  return map[id] ?? id;
}
