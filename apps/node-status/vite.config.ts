import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  define: { 'globalThis.__DEV__': 'import.meta.env.DEV' },
  clearScreen: false,
  plugins: [react()],
});
