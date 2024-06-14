/// <reference types="vitest" />

import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    browser: {
      name: 'chromium',
      provider: 'playwright',
      enabled: true,
      headless: true,
    },
  },
});
