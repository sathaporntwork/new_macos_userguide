import { defineConfig } from 'vite';

// base './' ทำให้ deploy บน GitHub Pages (project site ใน subpath) ได้ทันที
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
