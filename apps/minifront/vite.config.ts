import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { commitInfoPlugin } from './src/utils/commit-info-vite-plugin';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  base: './',
  plugins: [nodePolyfills(), react(), basicSsl(), commitInfoPlugin()],
});
