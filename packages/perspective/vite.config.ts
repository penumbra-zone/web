import { defineConfig } from 'vite';
import path from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: {
        transaction: './transaction/index.ts',
        plan: './plan/index.ts',
        translators: './translators/index.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: (source, importer) => {
        if (!importer) return false;
        const rel = path.relative(__dirname, source);
        const isExternal = rel.startsWith('@') || rel.startsWith('..');
        return isExternal;
      },
    },
  },
  plugins: [dts({ rollupTypes: true })],
});
