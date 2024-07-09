import React from 'react';
import globalsCssUrl from '../styles/globals.css?url';
import penumbraTheme from './penumbraTheme';
import { Normalize } from '../src/Normalize';

/** @type { import('@storybook/react').Preview } */
const preview = {
  decorators: [
    (Story, { title }) => {
      const css = title.startsWith('Deprecated/') ? (
        <link rel='stylesheet' type='text/css' href={globalsCssUrl} />
      ) : (
        <Normalize />
      );

      return (
        <>
          {css}
          <Story />
        </>
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
