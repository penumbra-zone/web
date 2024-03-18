import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: {
        amount: './src/amount.ts',
        base64: './src/base64.ts',
        box: './src/box.ts',
        'block-processor': './src/block-processor.ts',
        'customize-symbol': './src/customize-symbol.ts',
        environment: './src/environment.ts',
        hex: './src/hex.ts',
        'indexed-db': './src/indexed-db.ts',
        'internal-msg-offscreen': './src/internal-msg/offscreen.ts',
        'internal-msg-shared': './src/internal-msg/shared.ts',
        jsonified: './src/jsonified.ts',
        'lo-hi': './src/lo-hi.ts',
        querier: './src/querier.ts',
        registry: './src/registry.ts',
        servers: './src/servers.ts',
        services: './src/services.ts',
        staking: './src/staking.ts',
        'state-commitment-tree': './src/state-commitment-tree.ts',
        string: './src/string.ts',
        'user-choice': './src/user-choice.ts',
        utility: './src/utility.ts',
        validation: './src/validation.ts',
        wallet: './src/wallet.ts',
      },
      formats: ['es'],
    },
  },
  plugins: [dts({ rollupTypes: true })],
});
