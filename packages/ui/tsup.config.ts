import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['components/**/*.tsx', 'lib/**/*.ts', '!(components|lib)/**/*.(test|storybook).*'],
  format: ['esm'],
  keepNames: true,
  minify: true,
});
