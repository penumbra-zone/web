/// <reference types="vitest" />

import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    setupFiles: ['./src/chrome/test-utils/tests-setup.js'],
  },
});
