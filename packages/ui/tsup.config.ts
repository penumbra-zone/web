import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['components/**/*.tsx', 'lib/**/*.ts', 'lib/**/*.tsx', '!**/*.(test|storybook).*'],
  format: ['esm'],
  keepNames: true,
  minify: false,
  splitting: false,
});
