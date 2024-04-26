import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: {
        'Array.fromAsync': './src/Array.fromAsync.ts',
        'Map.groupBy': './src/Map.groupBy.ts',
        'Promise.withResolvers': './src/Promise.withResolvers.ts',
        'ReadableStream.from': './src/ReadableStream.from.ts',
        'ReadableStream[Symbol.asyncIterator]': './src/ReadableStream_Symbol.asyncIterator_.ts',
      },
      formats: ['es'],
    },
  },
  plugins: [dts({ rollupTypes: true })],
  test: {
    include: ['./src/*.test.ts'],
    browser: {
      name: 'chromium',
      provider: 'playwright',
      enabled: true,
      headless: true,
    },
  },
});
