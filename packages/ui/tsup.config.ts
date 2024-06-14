import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['components/**/*.tsx', 'lib/**/*.ts', '!**/*.(test|storybook).ts*'],
  clean: true,
  minify: true,
  dts: true,
  format: ['esm'],
});
