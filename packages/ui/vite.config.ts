import { defineConfig } from 'vite';
import { resolve, join } from 'path';
import { readdirSync, existsSync } from 'fs';
import dts from 'vite-plugin-dts';

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

export default defineConfig({
  plugins: [
    dts({
      strictOutput: true,
    }),
  ],
  build: {
    emptyOutDir: true,
    lib: {
      entry: getAllUIComponents(),
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
      ],
    },
  },
});
