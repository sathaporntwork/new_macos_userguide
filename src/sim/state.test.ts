import { describe, it, expect } from 'vitest';
import {
  defaultFS,
  resolvePath,
  listFolder,
  createFolder,
  createFile,
  removeNode,
  renameNode,
  searchFS,
} from './state';

// helper: home path
const HOME = ['Users', 'somchai'];

describe('virtual filesystem', () => {
  const fs = defaultFS();

  it('มีโฟลเดอร์พื้นฐานครบ', () => {
    const home = resolvePath(fs, HOME);
    expect(home?.kind).toBe('folder');
    const names = (home?.children ?? []).map((c) => c.name);
    expect(names).toContain('Desktop');
    expect(names).toContain('Documents');
    expect(names).toContain('Downloads');
  });

  it('resolvePath หาไฟล์เจอ', () => {
    const f = resolvePath(fs, [...HOME, 'Documents', 'ใบเสร็จค่าไฟ.pdf']);
    expect(f?.kind).toBe('file');
    expect(f?.name).toBe('ใบเสร็จค่าไฟ.pdf');
  });

  it('resolvePath path ผิดคืน null', () => {
    expect(resolvePath(fs, ['ไม่มีจริง', 'x'])).toBeNull();
  });

  it('listFolder เรียงโฟลเดอร์ก่อนไฟล์', () => {
    const items = listFolder(fs, [...HOME, 'Desktop']);
    expect(items[0]?.kind).toBe('folder');
  });

  it('createFolder สร้าง + กันชื่อซ้ำ', () => {
    const fs2 = defaultFS();
    expect(createFolder(fs2, [...HOME, 'Documents'], 'ทดสอบ')).toBe(true);
    expect(createFolder(fs2, [...HOME, 'Documents'], 'ทดสอบ')).toBe(true);
    const names = listFolder(fs2, [...HOME, 'Documents']).map((n) => n.name);
    expect(names.filter((n) => n.startsWith('ทดสอบ')).length).toBe(2);
  });

  it('createFile + renameNode', () => {
    const fs2 = defaultFS();
    expect(createFile(fs2, [...HOME, 'Desktop'], 'a.txt', 'สวัสดี')).toBe(true);
    expect(renameNode(fs2, [...HOME, 'Desktop'], 'a.txt', 'b.txt')).toBe(true);
    expect(resolvePath(fs2, [...HOME, 'Desktop', 'b.txt'])?.content).toBe('สวัสดี');
    expect(resolvePath(fs2, [...HOME, 'Desktop', 'a.txt'])).toBeNull();
  });

  it('removeNode คืน node ที่ลบ และไฟล์หายจริง', () => {
    const fs2 = defaultFS();
    const removed = removeNode(fs2, [...HOME, 'Documents'], 'ใบเสร็จค่าไฟ.pdf');
    expect(removed?.name).toBe('ใบเสร็จค่าไฟ.pdf');
    expect(resolvePath(fs2, [...HOME, 'Documents', 'ใบเสร็จค่าไฟ.pdf'])).toBeNull();
    expect(removeNode(fs2, [...HOME, 'Documents'], 'ไม่มีอยู่.abc')).toBeNull();
  });

  it('searchFS ค้นเจอทั้งชื่อไทยและ path', () => {
    const hits = searchFS(fs, 'ประชุม');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.node.name).toContain('ประชุม');
  });
});
