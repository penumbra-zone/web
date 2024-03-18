import { globbySync } from 'globby';
import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';
import tsconfigPaths from 'vite-tsconfig-paths';
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets';

// eslint-disable-next-line import/no-relative-packages
import workspacePkg from '../../package.json';

const components = Object.fromEntries(
  globbySync([
    'src/components/**/*.tsx',
    '!src/components/**/*.test.*',
    '!src/components/**/*.stories.*',
  ]).map(fileName => {
    // bare filename without extension
    const moduleName = path.relative('src', fileName).split('.')[0]!;
    return [moduleName, fileName];
  }),
);

export default defineConfig({
  build: {
    lib: {
      entry: {
        utils: 'src/utils/index.ts',
        ...components,
      },
      formats: ['es'],
    },
  },
  resolve: {
    preserveSymlinks: true,
  },
  plugins: [
    libAssetsPlugin({}),
    tsconfigPaths(),
    externalizeDeps({
      deps: true,
      devDeps: true,
      nodeBuiltins: true,
      optionalDeps: true,
      peerDeps: true,
      include: [
        ...Object.keys(workspacePkg.dependencies),
        ...Object.keys(workspacePkg.devDependencies),
      ],
      except: ['@penumbra-zone/tailwind-config'],
    }),
    dts({ rollupTypes: true }),
  ],
});
