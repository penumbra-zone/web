import { defineConfig } from 'vitest/config';
import wasm from 'vite-plugin-wasm';

export default defineConfig(({ mode }) => {
  return {
    define: { 'globalThis.__DEV__': mode === 'development' },
    plugins: [wasm()],
  };
});
