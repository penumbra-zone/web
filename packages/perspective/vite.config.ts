import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

export default defineConfig({
  build: {
    lib: {
      entry: {
        classification: './transaction/classification.ts',
        classify: './transaction/classify.ts',
        'action-view': './translators/action-view.ts',
        'address-view': './translators/address-view.ts',
        'memo-view': './translators/memo-view.ts',
        'output-view': './translators/output-view.ts',
        'spend-view': './translators/spend-view.ts',
        'get-address-view': './plan/get-address-view.ts',
        index: './plan/index.ts',
        'view-action-plan': './plan/view-action-plan.ts',
      },
      formats: ['es'],
    },
  },
  plugins: [dts({ rollupTypes: true }), externalizeDeps()],
});
