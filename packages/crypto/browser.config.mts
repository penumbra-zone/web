/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  // fix error - Buffer is not defined
  plugins: [nodePolyfills()],
  test: {
    include: ['**/encryption.test.ts', '**/sha256.test.ts'],
    browser: {
      name: 'chromium',
      provider: 'playwright',
      enabled: true,
      headless: true,
    },
  },
});
