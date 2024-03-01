/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable @typescript-eslint/dot-notation */
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import basicSsl from '@vitejs/plugin-basic-ssl';

import { execSync } from 'child_process';

let GIT_ORIGIN: string | undefined;
let GIT_DESCRIBE: string | undefined;
try {
  GIT_ORIGIN = String(execSync('git remote get-url origin')).trim();
  GIT_DESCRIBE = String(execSync('git describe --tags --always --dirty')).trim();
} catch {
  // whatever
}

export default defineConfig({
  base: './',
  plugins: [react(), splitVendorChunkPlugin(), basicSsl()],
  define: {
    GIT_ORIGIN: JSON.stringify(GIT_ORIGIN),
    GIT_DESCRIBE: JSON.stringify(GIT_DESCRIBE),
    BUILD_DATE: JSON.stringify(new Date().toISOString()),
  },
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
