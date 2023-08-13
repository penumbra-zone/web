/// <reference types="vitest" />

import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    setupFiles: ['./src/utils/tests.js'],
  },
});
