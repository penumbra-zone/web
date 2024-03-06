import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: ['./components/index.ts', './lib/utils.ts', './lib/toast/index.ts'],
      formats: ['es'],
    },
  },
  plugins: [dts()],
});
