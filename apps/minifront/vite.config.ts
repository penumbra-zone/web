/// <reference path="./vite-plugin-node-stdlib-browser.d.ts" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { commitInfoPlugin } from './src/utils/commit-info-vite-plugin';
import polyfillNode from 'vite-plugin-node-stdlib-browser';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
  return {
    define: { 'globalThis.__DEV__': mode !== 'production' },
    clearScreen: false,
    base: './',
    plugins: [
      polyfillNode(),
      react(),
      basicSsl(),
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
