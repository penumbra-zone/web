import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), splitVendorChunkPlugin(), basicSsl()],
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
  test: {
    snapshotSerializers: [],
    environment: 'jsdom',
    setupFiles: ['./tests-setup.ts'],
  },
});
