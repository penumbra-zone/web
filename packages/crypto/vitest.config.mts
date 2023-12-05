/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { defaultExclude } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...defaultExclude, '**/encryption.test.ts', '**/sha256.test.ts'],
  },
});
