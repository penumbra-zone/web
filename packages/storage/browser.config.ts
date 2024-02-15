import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/indexed-db.test.ts'],
    browser: {
      name: 'chromium',
      provider: 'playwright',
      enabled: true,
      headless: true,
    },
  },
});
