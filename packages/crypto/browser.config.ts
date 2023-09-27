/// <reference types="vitest" />
import { defineConfig } from 'vite';


export default defineConfig({
  test: {
    include: ['**/encryption.test.ts'],
    browser: {
      name: 'chrome',
      enabled: true,
      headless: true,
    },
  },
});
