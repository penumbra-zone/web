import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/indexed-db/index.ts'],
  format: ['esm'],
  keepNames: true,
  minify: false,
  splitting: false,
});
