import type { Meta, StoryObj } from '@storybook/react';

import { AssetIcon } from '.';
import {
  PENUMBRA_METADATA,
  DELEGATION_TOKEN_METADATA,
  UNBONDING_TOKEN_METADATA,
  UNKNOWN_TOKEN_METADATA,
  PIZZA_METADATA,
  LPNFT_METADATA,
} from '../utils/bufs';

const OPTIONS = {
  Penumbra: PENUMBRA_METADATA,
  Pizza: PIZZA_METADATA,
  'Delegation token': DELEGATION_TOKEN_METADATA,
  'Unbonding token': UNBONDING_TOKEN_METADATA,
  'LPNFT token': LPNFT_METADATA,
  'Unknown asset': UNKNOWN_TOKEN_METADATA,
};

const meta: Meta<typeof AssetIcon> = {
  title: 'AssetIcon/Single',
  component: AssetIcon,
  tags: ['autodocs', '!dev'],
  argTypes: {
    metadata: {
      options: Object.keys(OPTIONS),
      mapping: OPTIONS,
    },
    isDelegated: {
      control: 'boolean',
      description: 'When true, shows a delegation badge with "D" indicator',
    },
  },
};
export default meta;

type Story = StoryObj<typeof AssetIcon>;

export const Basic: Story = {
  args: {
    size: 'md',
    metadata: PENUMBRA_METADATA,
  },
};

export const WithDelegationBadge: Story = {
  args: {
    size: 'md',
    metadata: PENUMBRA_METADATA,
    isDelegated: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows an asset icon with a delegation badge. The badge displays a "D" indicator in the bottom-right corner.',
      },
    },
  },
};

export const DelegationBadgeSizes: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <div className='flex flex-col items-center gap-2'>
        <AssetIcon size='sm' metadata={PENUMBRA_METADATA} isDelegated={true} />
        <span className='text-xs'>Small</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <AssetIcon size='md' metadata={PENUMBRA_METADATA} isDelegated={true} />
        <span className='text-xs'>Medium</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <AssetIcon size='lg' metadata={PENUMBRA_METADATA} isDelegated={true} />
        <span className='text-xs'>Large</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows delegation badges at different sizes to demonstrate proper scaling.',
      },
    },
  },
};
