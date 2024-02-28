import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.*.ts'],
    setupFiles: ['./src/chrome/test-utils/tests-setup.js'],
    browser: {
      name: 'chromium',
      provider: 'playwright',
      enabled: true,
      headless: true,
    },
  },
});
