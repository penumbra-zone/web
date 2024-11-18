import { defineConfig } from 'vite';
import { resolve, join } from 'path';
import { readdirSync, existsSync } from 'fs';
import dts from 'vite-plugin-dts';
import path from 'node:path';
import tailwindcss from 'tailwindcss';

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

/** Extends the `getAllUIComponents` function to add support for other useful files */
const getAllEntries = (): Record<string, string> => {
  return {
    ...getAllUIComponents(),
  };
};

export default defineConfig({
  plugins: [dts()],
  resolve: {
    alias: {
      '@repo/tailwind-config': path.resolve(__dirname, '../', 'tailwind-config'),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss],
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
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          tailwindcss: 'tailwindcss',
        },
      },
    },
  },
});
