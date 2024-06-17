import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/*.ts', '!src/*.test.ts'],
  format: ['esm'],
  keepNames: true,
  loader: {
    '.wasm': 'file',
  },
  minify: true,
});
