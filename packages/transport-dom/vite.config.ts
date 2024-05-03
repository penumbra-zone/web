/// <reference types="vitest" />

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

export default defineConfig({
  build: {
    lib: {
      entry: {
        adapter: './src/adapter.ts',
        impl: './src/any-impl.ts',
        create: './src/create.ts',
        direct: './src/direct.ts',
        messages: './src/messages.ts',
        proxy: './src/proxy.ts',
        stream: './src/stream.ts',
      },
      formats: ['es'],
    },
  },
  plugins: [dts({ rollupTypes: true }), externalizeDeps({ except: ['@penumbra-zone/polyfills'] })],
  test: {
    include: ['**/*.test.ts'],
    browser: {
      name: 'chromium',
      provider: 'playwright',
      enabled: true,
      headless: true,
    },
  },
});
