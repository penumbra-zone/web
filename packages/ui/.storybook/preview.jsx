import React, { useState } from 'react';
import globalsCssUrl from '../styles/globals.css?url';
import penumbraTheme from './penumbraTheme';
import { ConditionalWrap } from '../src/utils/ConditionalWrap';
import { ThemeProvider } from '../src/ThemeProvider';
import { Density } from '../src/Density';
import { Tabs } from '../src/Tabs';
import styled from 'styled-components';

const WhiteTextWrapper = styled.div`
  color: ${props => props.theme.color.text.primary};
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(8)};
`;

const DensityWrapper = ({ children, includeDensityControl }) => {
  const [density, setDensity] = useState('sparse');

  return (
    <ConditionalWrap
      if={density === 'sparse'}
      then={children => <Density sparse>{children}</Density>}
      else={children => <Density compact>{children}</Density>}
    >
      <Column>
        {includeDensityControl && (
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
        <ThemeProvider>
          <DensityWrapper includeDensityControl={tags.includes('density')}>
            <WhiteTextWrapper>
              <Story />
            </WhiteTextWrapper>
          </DensityWrapper>
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
