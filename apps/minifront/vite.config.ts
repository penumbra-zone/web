import { defineConfig, loadEnv } from 'vite';
import path from 'node:url';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react-swc';
import polyfillNode from 'vite-plugin-node-stdlib-browser';
import { commitInfoPlugin } from './src/utils/commit-info-vite-plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'PRAX');

  const prax_external = Boolean(JSON.parse(env['PRAX_EXTERNAL'] ?? 'false')) || undefined;

  const config = {
    clearScreen: false,
    resolve: {
      alias: prax_external && {
        '@penumbra-zone/client/prax': path.fileURLToPath(
          import.meta.resolve('@penumbra-zone/client-chrome/prax'),
        ),
      },
    },
    base: './',
    plugins: [polyfillNode(), react(), basicSsl(), commitInfoPlugin()],
  };

  return config;
});
