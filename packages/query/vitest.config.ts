import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  return {
    define: { 'globalThis.__DEV__': mode === 'development' },
  };
});
