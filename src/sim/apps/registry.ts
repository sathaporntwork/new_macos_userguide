/** Registry ของแอปใน simulator */

import type { WindowState } from '../state';
import type { Simulator } from '../simulator';
import type { MenuItem } from '../menu';

export interface MenuSpec {
  title: string;
  items: MenuItem[];
}

export interface AppDef {
  id: string;
  /** ชื่อไทยที่แสดง */
  name: string;
  en: string;
  /** key ของไอคอนใน ICONS */
  icon: string;
  /** แสดงบน dock */
  dock?: boolean;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  /** เมนูเฉพาะแอปบนเมนูบาร์ */
  menus?: (sim: Simulator) => MenuSpec[];
  render(body: HTMLElement, sim: Simulator, win: WindowState): void;
}
