import { defineConfig } from 'vitest/config';
import { defaultExclude } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...defaultExclude, '**/encryption.test.ts', '**/sha256.test.ts'],
  },
});
