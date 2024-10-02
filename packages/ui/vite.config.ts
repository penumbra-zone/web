import { defineConfig } from 'vite';
import { resolve, join } from 'path';
import { readdirSync, existsSync } from 'fs';
import dts from 'vite-plugin-dts';
import { exec } from 'child_process';
import * as path from 'node:path';

/**
 * Returns an object with keys as resulting component build paths and values as
 * their initial paths, e.g. `{ 'src/Button/index': 'src/Button/index.tsx' }`.
 * This way, Vite can build each component separately while extracting shared code
 * */
const getAllUIComponents = (): Record<string, string> => {
  const source = resolve(__dirname, 'src');
  const dirs = readdirSync(source, { withFileTypes: true });

  return dirs.reduce(
    (accum, dir) => {
      const componentPath = join(source, dir.name, 'index.tsx');
      if (dir.isDirectory() && existsSync(componentPath)) {
        accum[`src/${dir.name}/index`] = componentPath;
      }
      return accum;
    },
    {} as Record<string, string>,
  );
};

const getDeprecatedUIComponents = (): Record<string, string> => {
  const source = resolve(__dirname, 'components/ui');
  return getRecursiveTsxFiles(source, 'components/ui');
};

const getRecursiveTsxFiles = (dir: string, baseDir: string): Record<string, string> => {
  const files = readdirSync(dir, { withFileTypes: true });
  return files.reduce(
    (accum, file) => {
      const fullPath = join(dir, file.name);
      const relativePath = path.relative(resolve(__dirname, baseDir), fullPath);
      if (file.isDirectory()) {
        return { ...accum, ...getRecursiveTsxFiles(fullPath, baseDir) };
      } else if (file.isFile() && file.name.endsWith('.tsx')) {
        const key = `${baseDir}/${relativePath.replace(/\.tsx$/, '')}`;
        accum[key] = fullPath;
      }
      return accum;
    },
    {} as Record<string, string>,
  );
};

/** Extends the `getAllUIComponents` function to add support for other useful files */
const getAllEntries = (): Record<string, string> => {
  return {
    tailwindconfig: resolve('../tailwind-config'),
    'src/tailwindConfig': join(__dirname, 'src', 'tailwindConfig.ts'),
    ...getDeprecatedUIComponents(),
    ...getAllUIComponents(),
  };
};

export default defineConfig({
  plugins: [
    dts(),
    {
      // runs 'pnpm pack' after the build in watch mode
      name: 'postbuild-pack',
      closeBundle: () => {
        const isWatch = process.env.VITE_WATCH === 'true';
        if (isWatch) {
          const cmd = exec('$npm_execpath pack');
          cmd.unref();
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@repo/tailwind-config': path.resolve(__dirname, '../', 'tailwind-config'),
    },
  },
  build: {
    emptyOutDir: true,
    lib: {
      entry: getAllEntries(),
      formats: ['es'],
      name: '@penumbra-zone/ui',
    },
    rollupOptions: {
      external: [
        '@bufbuild/protobuf',
        '@penumbra-zone/protobuf',
        'react',
        'react-dom',
        'framer-motion',
        'styled-components',
        'lucide-react',
        'react-router-dom',
      ],
    },
  },
});
