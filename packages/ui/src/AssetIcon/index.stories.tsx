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

export const DelegationToken: Story = {
  args: {
    size: 'md',
    metadata: DELEGATION_TOKEN_METADATA,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows a delegation token with its custom icon. Delegation tokens are automatically recognized by their display denomination and show a delegation-specific icon.',
      },
    },
  },
};

export const AllTokenTypes: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <div className='flex flex-col items-center gap-2'>
        <AssetIcon size='md' metadata={PENUMBRA_METADATA} />
        <span className='text-xs'>Penumbra</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <AssetIcon size='md' metadata={DELEGATION_TOKEN_METADATA} />
        <span className='text-xs'>Delegation</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <AssetIcon size='md' metadata={UNBONDING_TOKEN_METADATA} />
        <span className='text-xs'>Unbonding</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <AssetIcon size='md' metadata={LPNFT_METADATA} />
        <span className='text-xs'>Position</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows different token types with their respective icons and automatic recognition.',
      },
    },
  },
};
