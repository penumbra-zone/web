import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), splitVendorChunkPlugin()],
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
