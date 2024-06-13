import { penumbraEslintConfig } from '@repo/eslint-config';
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
