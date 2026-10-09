/** helpers สำหรับสร้างสถานะเริ่มต้นของบทเรียน */

import { appDisplayName, type SimState, type WindowState } from '../sim/state';

let seedCounter = 0;

export function win(app: string, opts: Partial<WindowState> = {}): WindowState {
  seedCounter++;
  return {
    id: `seed-${app}-${seedCounter}`,
    app,
    title: appDisplayName(app),
    x: 80 + (seedCounter % 4) * 34,
    y: 56 + (seedCounter % 4) * 30,
    w: 720,
    h: 460,
    z: seedCounter,
    minimized: false,
    zoomed: false,
    space: 0,
    ...opts,
  };
}

export function openFinder(path?: string[], trash = false): Partial<SimState> {
  const w = win('finder', { payload: trash ? { trash: true } : path ? { path } : undefined });
  return { windows: [w], runningApps: ['finder'], focusedApp: 'finder' };
}

export function openApps(...apps: string[]): Partial<SimState> {
  const windows = apps.map((a) => win(a));
  return { windows, runningApps: apps, focusedApp: apps[apps.length - 1] ?? null };
}
