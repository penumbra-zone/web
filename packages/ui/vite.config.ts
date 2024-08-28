import { defineConfig } from 'vite';
import { resolve, join } from 'path';
import { readdirSync, existsSync } from 'fs';
import dts from 'vite-plugin-dts';
import { exec } from 'child_process';

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
  build: {
    emptyOutDir: true,
    lib: {
      entry: {
        'src/tailwindConfig': join(__dirname, 'src', 'tailwindConfig.ts'),
        ...getAllUIComponents(),
      },
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
