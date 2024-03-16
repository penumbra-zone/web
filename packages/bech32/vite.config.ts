import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import pkg from './package.json';

export default defineConfig({
  build: {
    lib: {
      entry: ['./src/index.ts'],
      formats: ['es'],
    },
    rollupOptions: {
      external: Object.keys(pkg.dependencies),
    },
  },
  plugins: [dts({ rollupTypes: true })],
});
