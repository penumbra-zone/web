import { defineConfig } from 'vitest/config';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [wasm()],
  assetsInclude: ['**/*_pk.bin'],
  test: {
    setupFiles: ['./tests-setup.js'],
  },
});
