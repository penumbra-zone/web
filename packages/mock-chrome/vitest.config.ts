import { defineConfig } from 'vitest/config';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [topLevelAwait()],
  test: {
    include: ['src/**/*.test.ts'],
    browser: {
      name: 'chromium',
      provider: 'playwright',
      enabled: true,
      headless: true,
    },
  },
});
