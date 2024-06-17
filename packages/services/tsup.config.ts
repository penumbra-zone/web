import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/ctx/*.ts', 'src/*/index.ts'],
  format: ['esm'],
  keepNames: true,
  minify: false,
  splitting: false,
});
