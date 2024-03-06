import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  build: {
    lib: {
      entry: ['./src/index.ts', './src/proving-keys.ts', './src/build.ts', './src/planner.ts'],
      formats: ['es'],
    },
  },
  plugins: [dts(), wasm(), topLevelAwait()],
});
