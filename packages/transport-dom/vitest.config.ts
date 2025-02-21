/// <reference types="vitest" />

import { defineConfig } from 'vite';

export default defineConfig({
  define: { __DEV__: true },
  test: {
    include: ['src/*.test.ts'],
    browser: {
      name: 'chromium',
      provider: 'playwright',
      enabled: true,
      headless: true,
    },
  },
});
