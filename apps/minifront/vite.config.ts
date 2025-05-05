/// <reference path="./vite-plugin-node-stdlib-browser.d.ts" />

import react from '@vitejs/plugin-react-swc';
import url from 'node:url';
import { defineConfig } from 'vite';
import polyfillNode from 'vite-plugin-node-stdlib-browser';
import svgr from 'vite-plugin-svgr';
import { commitInfoPlugin } from './src/utils/commit-info-vite-plugin';

export default defineConfig(({ mode }) => ({
  define: { 'globalThis.__DEV__': mode !== 'production' },
  clearScreen: false,
  base: './',
  resolve: {
    alias: {
      '@amplitude/analytics-browser': url.fileURLToPath(import.meta.resolve('./amplitude-stub.js')),
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
}));
