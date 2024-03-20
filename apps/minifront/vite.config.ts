import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { commitInfoPlugin } from './src/utils/commit-info-vite-plugin';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  base: './',
  plugins: [react(), splitVendorChunkPlugin(), basicSsl(), commitInfoPlugin(), nodePolyfills()],
  build: {
    rollupOptions: {
      output: {
        // configure additional chunks based on file path
        manualChunks: (id: string) => {
          if (id.includes('@buf')) return 'protobuf';
          return;
        },
      },
    },
  },
});
