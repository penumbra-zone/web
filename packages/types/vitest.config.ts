import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: { 'globalThis.__DEV__': 'import.meta.env.DEV' },
});
