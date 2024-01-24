/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      buffer: 'Buffer',
    },
  },
  test: {
    include: ['**/sha256.test.ts'],
    /**
     * @todo: Get the below tests to pass reliably in CI, then uncomment them.
     * @see https://github.com/penumbra-zone/web/issues/379
     */
    // include: ['**/encryption.test.ts', '**/sha256.test.ts'],
    browser: {
      name: 'chromium',
      provider: 'playwright',
      enabled: true,
      headless: true,
    },
  },
});
