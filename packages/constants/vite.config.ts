import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: {
        assets: './src/assets.ts',
      },
      formats: ['es'],
    },
  },
  plugins: [dts({ rollupTypes: true })],
});
