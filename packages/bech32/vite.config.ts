import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

// eslint-disable-next-line import/no-relative-packages
import workspaceRoot from '../../package.json';

export default defineConfig({
  build: {
    lib: {
      entry: ['./src/index.ts'],
      formats: ['es'],
    },
  },
  plugins: [
    dts({ rollupTypes: true }),
    externalizeDeps({
      include: Object.keys({
        ...workspaceRoot.dependencies,
        ...workspaceRoot.devDependencies,
      }),
    }),
  ],
});
