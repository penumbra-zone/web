import { join, dirname } from 'path';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: [
    {
      directory: '../src',
      files: '**/@(*.stories.@(js|jsx|mjs|ts|tsx)|*.mdx)',
      titlePrefix: 'UI library',
    },
    {
      directory: '../components',
      files: '**/@(*.stories.@(js|jsx|mjs|ts|tsx)|*.mdx)',
      titlePrefix: 'Deprecated',
    },
  ],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    '@storybook/addon-postcss',
    '@storybook/preview-api',
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};
export default config;
