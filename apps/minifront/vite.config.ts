import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { commitInfoPlugin } from './src/utils/commit-info-vite-plugin';
import polyfillNode from 'vite-plugin-node-stdlib-browser';

export default defineConfig({
  define: { 'globalThis.__DEV__': 'import.meta.env.DEV' },
  clearScreen: false,
  base: './',
  plugins: [polyfillNode(), react(), basicSsl(), commitInfoPlugin()],
});
