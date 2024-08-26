import React, { useState } from 'react';
import globalsCssUrl from '../styles/globals.css?url';
import penumbraTheme from './penumbraTheme';
import { ConditionalWrap } from '../src/ConditionalWrap';
import { PenumbraUIProvider } from '../src/PenumbraUIProvider';
import { Density } from '../src/Density';
import { Tabs } from '../src/Tabs';
import styled from 'styled-components';

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(8)};
`;

/**
 * Utility component to let users control the density, for components whose
 * stories include the `density` tag.
 */
const DensityWrapper = ({ children, showDensityControl }) => {
  const [density, setDensity] = useState('sparse');

  return (
    <ConditionalWrap
      if={density === 'sparse'}
      then={children => <Density sparse>{children}</Density>}
      else={children => <Density compact>{children}</Density>}
    >
      <Column>
        {showDensityControl && (
          <Tabs
            options={[
              { label: 'Sparse', value: 'sparse' },
              { label: 'Compact', value: 'compact' },
            ]}
            value={density}
            onChange={setDensity}
          />
        )}

        {children}
      </Column>
    </ConditionalWrap>
  );
};

/** @type { import('@storybook/react').Preview } */
const preview = {
  decorators: [
    (Story, { title, tags }) => {
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
        <PenumbraUIProvider>
          <DensityWrapper showDensityControl={tags.includes('density')}>
            <Story />
          </DensityWrapper>
        </PenumbraUIProvider>
      );
    },
  ],
  argTypes: {
    // The `motion` prop is used throughout many Penumbra UI components for
    // framer-motion settings, and shouldn't be controlled in Storybook.
    motion: { control: false },
  },
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
