import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react-swc';
import polyfillNode from 'vite-plugin-node-stdlib-browser';
import svgr from 'vite-plugin-svgr';
import url from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  return {
    define: { 'globalThis.__DEV__': mode !== 'production' },
    publicDir: './shared/public',
    clearScreen: false,
    base: './',
    resolve: {
      alias: {
        '@app': path.resolve(__dirname, 'app'),
        '@pages': path.resolve(__dirname, 'pages'),
        '@shared': path.resolve(__dirname, 'shared'),
        '@entities': path.resolve(__dirname, 'entities'),
        '@features': path.resolve(__dirname, 'features'),
        '@widgets': path.resolve(__dirname, 'widgets'),
        '@amplitude/analytics-browser': url.fileURLToPath(
          import.meta.resolve('@repo/stubs/amplitude-analytics-browser'),
        ),
      },
    },
    plugins: [
      polyfillNode(),
      react(),
      svgr({
        include: '**/*.svg',
        svgrOptions: {
          exportType: 'default',
        },
      }),
    ],
  };
});
