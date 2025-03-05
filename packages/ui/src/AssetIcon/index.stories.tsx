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
