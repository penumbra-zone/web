import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: ['./src/index.ts', './src/asset.ts'],
      formats: ['es'],
    },
  },
  plugins: [dts()],
});
