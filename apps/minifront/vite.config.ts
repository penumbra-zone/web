/// <reference path="./vite-plugin-node-stdlib-browser.d.ts" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { commitInfoPlugin } from './src/utils/commit-info-vite-plugin';
import polyfillNode from 'vite-plugin-node-stdlib-browser';
import svgr from 'vite-plugin-svgr';
import url from 'node:url';

export default defineConfig(({ mode }) => {
  return {
    define: { 'globalThis.__DEV__': mode !== 'production' },
    clearScreen: false,
    base: './',
    resolve: {
      alias: {
        '@amplitude/analytics-browser': url.fileURLToPath(
          import.meta.resolve('@repo/stubs/amplitude-analytics-browser'),
        ),
      },
    },
    plugins: [
      polyfillNode(),
      react(),
      commitInfoPlugin(),
      svgr({
        include: '**/*.svg',
        svgrOptions: {
          exportType: 'default',
        },
      }),
    ],
  };
});
