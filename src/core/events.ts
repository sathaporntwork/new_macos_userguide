/**
 * Typed event bus — หัวใจของการสื่อสารระหว่าง simulator กับ tutor engine
 * ทุกการกระทำใน simulator จะ emit event และ engine ใช้ตรวจว่าผู้เรียนทำถูกขั้นหรือไม่
 */

export type SimEvent =
  // แอป
  | { type: 'app:open'; app: string }
  | { type: 'app:quit'; app: string }
  | { type: 'app:minimize'; app: string }
  | { type: 'app:minimizeAll'; app: string }
  // หน้าต่าง
  | { type: 'window:close'; app: string }
  | { type: 'window:zoom'; app: string }
  | { type: 'window:drag'; app: string }
  | { type: 'window:resize'; app: string }
  | { type: 'window:focus'; app: string }
  // เมนู
  | { type: 'menu:open'; menu: string }
  | { type: 'menu:click'; menu: string; item: string }
  | { type: 'apple:about' }
  | { type: 'apple:settings' }
  | { type: 'apple:forcequit' }
  | { type: 'apple:sleep' }
  // Dock
  | { type: 'dock:click'; app: string }
  | { type: 'dock:magnify' }
  | { type: 'dock:trash' }
  | { type: 'dock:launchpad' }
  // Launchpad
  | { type: 'launchpad:open' }
  | { type: 'launchpad:close' }
  // Spotlight
  | { type: 'spotlight:open' }
  | { type: 'spotlight:close' }
  | { type: 'spotlight:search'; query: string }
  | { type: 'spotlight:openResult'; kind: 'app' | 'file' | 'calc' | 'clipboard' | 'action'; value: string }
  | { type: 'spotlight:clipboard' }
  // Finder / ไฟล์
  | { type: 'finder:navigate'; path: string }
  | { type: 'finder:view'; view: 'icon' | 'list' }
  | { type: 'finder:sidebar'; item: string }
  | { type: 'finder:newFolder' }
  | { type: 'finder:rename'; name: string }
  | { type: 'finder:trash'; name: string }
  | { type: 'finder:color'; color: string }
  | { type: 'finder:sort' }
  | { type: 'finder:select'; name: string }
  | { type: 'file:open'; name: string }
  | { type: 'trash:restore'; name: string }
  | { type: 'file:copy'; name?: string }
  | { type: 'file:paste'; name?: string }
  | { type: 'file:info' }
  // Trash
  | { type: 'trash:open' }
  | { type: 'trash:empty' }
  // System Settings
  | { type: 'settings:open' }
  | { type: 'settings:pane'; pane: string }
  | { type: 'settings:appearance'; mode: 'light' | 'dark' }
  | { type: 'settings:accent' }
  | { type: 'settings:wallpaper'; wallpaper: string }
  | { type: 'settings:dockSize'; size: number }
  | { type: 'settings:naturalScroll'; value: boolean }
  | { type: 'settings:hotcorner'; corner: string }
  | { type: 'settings:stageManager'; value: boolean }
  // คีย์ลัด (keys เป็น string มาตรฐาน เช่น 'cmd+space', 'cmd+shift+4')
  | { type: 'shortcut'; keys: string }
  // Mission Control / Spaces / Stage Manager
  | { type: 'missioncontrol:open' }
  | { type: 'missioncontrol:close' }
  | { type: 'space:switch'; index: number }
  | { type: 'space:create' }
  | { type: 'stageManager:toggle'; value: boolean }
  | { type: 'splitview:enter' }
  // แอปต่าง ๆ
  | { type: 'notes:create' }
  | { type: 'notes:edit' }
  | { type: 'safari:navigate'; url: string }
  | { type: 'safari:bookmark' }
  | { type: 'terminal:command'; command: string }
  | { type: 'activitymonitor:open' }
  | { type: 'about:open' }
  // เดสก์ท็อป / Control Center
  | { type: 'desktop:contextmenu' }
  | { type: 'controlcenter:open' }
  | { type: 'controlcenter:toggle'; control: string; value: boolean }
  | { type: 'widgets:open' };

/** รูปแบบ event ที่ step ต้องการ — ระบุเฉพาะ field ที่ต้องการเทียบ */
export type EventPattern = {
  [K in SimEvent['type']]: Partial<Extract<SimEvent, { type: K }>> extends infer T
    ? T extends never
      ? never
      : { type: K } & Partial<Extract<SimEvent, { type: K }>>
    : never;
}[SimEvent['type']];

type Handler = (event: SimEvent) => void;

class EventBus {
  private handlers = new Set<Handler>();
  private log: SimEvent[] = [];

  on(handler: Handler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  emit(event: SimEvent): void {
    this.log.push(event);
    if (this.log.length > 500) this.log.shift();
    this.handlers.forEach((h) => h(event));
  }

  /** เทียบ event กับ pattern — ทุก field ที่ระบุใน pattern ต้องตรง */
  matches(event: SimEvent, pattern: EventPattern): boolean {
    if (event.type !== pattern.type) return false;
    const rest = pattern as Record<string, unknown>;
    const evt = event as Record<string, unknown>;
    for (const key of Object.keys(rest)) {
      if (key === 'type') continue;
      if (evt[key] !== rest[key]) return false;
    }
    return true;
  }

  clearLog(): void {
    this.log = [];
  }
}

export const bus = new EventBus();

/** ตรวจว่า pattern ตรงกับ event หรือไม่ (ฟังก์ชันล้วนสำหรับ test) */
export function eventMatches(event: SimEvent, pattern: EventPattern): boolean {
  return bus.matches(event, pattern);
}
