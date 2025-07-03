import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import url from 'node:url';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  return {
    define: { 'globalThis.__DEV__': mode !== 'production' },
    publicDir: './src/shared/public',
    clearScreen: false,
    base: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@/app': path.resolve(__dirname, 'src/app'),
        '@/pages': path.resolve(__dirname, 'src/pages'),
        '@/shared': path.resolve(__dirname, 'src/shared'),
        '@/entities': path.resolve(__dirname, 'src/entities'),
        '@/features': path.resolve(__dirname, 'src/features'),
        '@/widgets': path.resolve(__dirname, 'src/widgets'),
        '@ui': path.resolve(__dirname, '../../packages/ui/src'),
        '@amplitude/analytics-browser': url.fileURLToPath(
          import.meta.resolve('@repo/stubs/amplitude-analytics-browser'),
        ),
      },
    },
    plugins: [
      tailwindcss(),
      react(),
      svgr({
        include: '**/*.svg',
        svgrOptions: {
          exportType: 'default',
        },
      }),
    ],
  };
});
