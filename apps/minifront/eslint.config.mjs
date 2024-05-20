import { penumbraEslintConfig } from '@penumbra-zone/eslint-config';
import { config, parser } from 'typescript-eslint';

export default config({
  ...penumbraEslintConfig,
  languageOptions: {
    parser,
    parserOptions: {
      project: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
