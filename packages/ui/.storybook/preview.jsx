import React from 'react';
import globalsCssUrl from '../styles/globals.css?url';
import penumbraTheme from './penumbraTheme';
import { ThemeProvider } from '../src/ThemeProvider';

/** @type { import('@storybook/react').Preview } */
const preview = {
  decorators: [
    (Story, { title }) => {
      const isDeprecatedComponent = title.startsWith('Deprecated/');

      if (isDeprecatedComponent) {
        return (
          <>
            <link rel='stylesheet' type='text/css' href={globalsCssUrl} />
            <Story />
          </>
        );
      }

      return (
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      );
    },
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: penumbraTheme,
    },
  },
};

export default preview;
