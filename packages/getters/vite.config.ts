import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: {
        'address-view': './src/address-view.ts',
        'delegations-by-address-index-response': './src/delegations-by-address-index-response.ts',
        'funding-stream': './src/funding-stream.ts',
        metadata: './src/metadata.ts',
        'rate-data': './src/rate-data.ts',
        string: './src/string.ts',
        swap: './src/swap.ts',
        'swap-record': './src/swap-record.ts',
        'spendable-note-record': './src/spendable-note-record.ts',
        'trading-pair': './src/trading-pair.ts',
        transaction: './src/transaction.ts',
        'unclaimed-swaps-response': './src/unclaimed-swaps-response.ts',
        'undelegate-claim': './src/undelegate-claim.ts',
        'undelegate-claim-body': './src/undelegate-claim-body.ts',
        validator: './src/validator.ts',
        'validator-info': './src/validator-info.ts',
        'validator-info-response': './src/validator-info-response.ts',
        'validator-state': './src/validator-state.ts',
        'validator-status': './src/validator-status.ts',
        value: './src/value.ts',
        'value-view': './src/value-view.ts',
      },
      formats: ['es'],
    },
  },
  plugins: [dts({ rollupTypes: true })],
});
