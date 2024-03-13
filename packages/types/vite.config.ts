import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: {
        registry: './src/registry.ts',
        base64: './src/base64.ts',
        'state-commitment-tree': './src/state-commitment-tree.ts',
        servers: './src/servers.ts',
        'indexed-db': './src/indexed-db.ts',
        validation: './src/validation.ts',
        'lo-hi': './src/lo-hi.ts',
        environment: './src/environment.ts',
        box: './src/box.ts',
        wallet: './src/wallet.ts',
        utility: './src/utility.ts',
        transaction: './src/transaction',
        translators: './src/translators',
        hex: './src/hex.ts',
        string: './src/string.ts',
        address: './src/address.ts',
        services: './src/services.ts',
        'block-processor': './src/block-processor.ts',
        querier: './src/querier.ts',
        amount: './src/amount.ts',
        jsonified: './src/jsonified.ts',
        staking: './src/staking.ts',
        'identity-key': './src/identity-key.ts',
        'customize-symbol': './src/customize-symbol.ts',
        'user-choice': './src/user-choice.ts',
        'internal-msg-offscreen': './src/internal-msg/offscreen.ts',
        'internal-msg-shared': './src/internal-msg/shared.ts',
      },
      formats: ['es'],
    },
  },
  plugins: [dts({ rollupTypes: true })],
});
