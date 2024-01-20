/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['**/encryption.test.ts', '**/sha256.test.ts'],
    environment: 'jsdom',
    setupFiles: ['./tests-setup.browser.ts'],
  },
});
