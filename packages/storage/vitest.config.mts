/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { defaultExclude } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./src/chrome/test-utils/tests-setup.js'],
    exclude: [...defaultExclude, '**/indexed-db.test.ts'],
  },
});
