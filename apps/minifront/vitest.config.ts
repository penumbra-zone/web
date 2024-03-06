import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    snapshotSerializers: [],
    environment: 'jsdom',
    setupFiles: ['./tests-setup.ts'],
  },
});
