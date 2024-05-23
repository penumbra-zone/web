import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react-swc';
import polyfillNode from 'vite-plugin-node-stdlib-browser';
import { commitInfoPlugin } from './src/utils/commit-info-vite-plugin';

export default defineConfig({
  clearScreen: false,
  base: './',
  plugins: [polyfillNode(), react(), basicSsl(), commitInfoPlugin()],
});
