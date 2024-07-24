import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    define: { 'globalThis.__DEV__': mode !== 'production' },
    clearScreen: false,
    plugins: [react()],
  };
});
