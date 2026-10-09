/** Mini reactive store — state + subscribe แบบเรียบง่ายพอสำหรับโปรเจกต์นี้ */

export type Unsubscribe = () => void;

export class Store<T extends object> {
  private state: T;
  private listeners = new Set<(state: T) => void>();

  constructor(initial: T) {
    this.state = initial;
  }

  get(): T {
    return this.state;
  }

  set(patch: Partial<T> | ((prev: T) => Partial<T>)): void {
    const p = typeof patch === 'function' ? patch(this.state) : patch;
    this.state = { ...this.state, ...p };
    this.listeners.forEach((l) => l(this.state));
  }

  update(fn: (prev: T) => Partial<T>): void {
    this.state = { ...this.state, ...fn(this.state) };
    this.listeners.forEach((l) => l(this.state));
  }

  subscribe(listener: (state: T) => void): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
