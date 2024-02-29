import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { commitHashPlugin } from './src/utils/commit-hash-vite-plugin';

export default defineConfig({
  base: './',
  plugins: [react(), splitVendorChunkPlugin(), basicSsl(), commitHashPlugin()],
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
