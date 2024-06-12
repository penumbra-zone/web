import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
      },
      formats: ['es'],
    },
  },
  plugins: [
    wasm(),
    topLevelAwait(),
    dts({ rollupTypes: true }),
    externalizeDeps({ except: ['@penumbra-zone/polyfills/ReadableStream[Symbol.asyncIterator]'] }),
  ],
});
