/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { defaultExclude } from 'vitest/config';

// NOTE: the web crypto API requires running in a browser environment

export default defineConfig({
  test: {
    exclude: [...defaultExclude, '**/encryption.test.ts'],
  },
});
