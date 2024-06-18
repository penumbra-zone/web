import { defineConfig } from 'vitest/config';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  define: { 'globalThis.__DEV__': 'import.meta.env.DEV' },
  plugins: [wasm()],
});
