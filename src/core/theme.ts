/** ธีมมืด/สว่างของเว็บ — จำค่าไว้ใน localStorage ค่าเริ่มต้นตาม system preference */

const KEY = 'macpath26:theme';

export type Theme = 'light' | 'dark';

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/** อ่านค่าที่บันทึกไว้ ถ้าไม่มีใช้ system preference */
export function preferredTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // โหมดส่วนตัว — ใช้ system preference
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

/** เรียกตอนโหลดแอป (index.html มี inline script รองรับไว้ก่อนแล้วเพื่อกัน flash) */
export function initTheme(): void {
  applyTheme(preferredTheme());
  // ถ้าผู้ใช้ไม่เคยเลือกเอง ให้ตามระบบแม้เปลี่ยนภายหลัง
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    try {
      if (!localStorage.getItem(KEY)) applyTheme(e.matches ? 'dark' : 'light');
    } catch {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // บันทึกไม่ได้ก็ใช้ไปก่อนในเซสชันนี้
  }
  return next;
}
