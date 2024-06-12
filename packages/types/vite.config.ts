import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

export default defineConfig({
  build: {
    lib: {
      entry: {
        amount: './src/amount.ts',
        assets: './src/assets.ts',
        base64: './src/base64.ts',
        environment: './src/environment.ts',
        hex: './src/hex.ts',
        jsonified: './src/jsonified.ts',
        'lo-hi': './src/lo-hi.ts',
        querier: './src/querier.ts',
        staking: './src/staking.ts',
        'state-commitment-tree': './src/state-commitment-tree.ts',
        string: './src/string.ts',
        validation: './src/validation.ts',
      },
      formats: ['es'],
    },
  },
  plugins: [dts({ rollupTypes: true }), externalizeDeps()],
});
