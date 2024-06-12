import { defineConfig } from 'vitest/config';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
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
