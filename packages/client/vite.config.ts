import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: ['./src/index.ts', './src/get-port.ts', './src/prax.ts', './src/global.ts'],
      formats: ['es'],
    },
  },
  plugins: [dts()],
});
