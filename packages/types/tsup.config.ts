import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/*.ts', 'src/internal-msg/*.ts', '!src/*.test.ts'],
  format: ['esm'],
  keepNames: true,
  minify: true,
});
