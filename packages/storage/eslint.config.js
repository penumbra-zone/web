import baseConfig from '../..//eslint.config.js';
import requireDbPutEmitUpdate from './require-db-put-emit-update.js';

baseConfig.push({
  name: 'storage:custom-rules',
  files: ['src/indexed-db/index.ts'],
  plugins: {
    storage: {
      rules: {
        'require-db-put-emit-update': requireDbPutEmitUpdate,
      },
    },
  },
  rules: {
    'storage/require-db-put-emit-update': 'error',
  },
});

export default baseConfig;
