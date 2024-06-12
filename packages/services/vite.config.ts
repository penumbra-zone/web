import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

export default defineConfig({
  build: {
    lib: {
      entry: {
        'ctx-approver': 'src/ctx/approver.ts',
        'ctx-full-viewing-key': 'src/ctx/full-viewing-key.ts',
        'ctx-fullnode': 'src/ctx/fullnode.ts',
        'ctx-spend-key': 'src/ctx/spend-key.ts',
        'ctx-wallet-id': 'src/ctx/wallet-id.ts',
        'ctx-custody-client': 'src/ctx/custody-client.ts',
        'ctx-database': 'src/ctx/database.ts',
        'ctx-offscreen': 'src/ctx/offscreen.ts',
        'ctx-stake-client': 'src/ctx/stake-client.ts',
        'sct-service': './src/sct-service/index.ts',
        'view-service': './src/view-service/index.ts',
        'custody-service': './src/custody-service/index.ts',
        'stake-service': './src/stake-service/index.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      //output: { preserveModules: true, },
    },
  },
  plugins: [
    wasm(),
    dts({ rollupTypes: true }),
    externalizeDeps({ except: ['@penumbra-zone/polyfills/Array.fromAsync'] }),
  ],
});
