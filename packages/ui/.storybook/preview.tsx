import type { Preview } from '@storybook/react';
import penumbraTheme from './penumbra-theme';
import { useState } from 'react';
import { ConditionalWrap } from '../src/ConditionalWrap';
import { Density } from '../src/Density';
import { Tabs } from '../src/Tabs';

import './tailwind.css';
import '../src/theme/fonts.css';
import '../src/theme/globals.css';

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
      <div className='flex flex-col gap-4'>
        {showDensityControl && (
          <Density sparse>
            <Tabs
              options={[
                { label: 'Sparse', value: 'sparse' },
                { label: 'Compact', value: 'compact' },
              ]}
              value={density}
              onChange={setDensity}
            />
          </Density>
        )}

        {children}
      </div>
    </ConditionalWrap>
  );
};

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      theme: penumbraTheme,
    },
  },
  decorators: [
    (Story, { title, tags }) => {
      return (
        <DensityWrapper showDensityControl={tags.includes('density')}>
          <Story />
        </DensityWrapper>
      );
    },
  ],
};

export default preview;
