import type { Meta, StoryObj } from '@storybook/react';
import { WalletBalance } from '.';
import { OSMO_BALANCE, PENUMBRA2_BALANCE, PENUMBRA_BALANCE } from '../utils/bufs';

const meta: Meta<typeof WalletBalance> = {
  component: WalletBalance,
  tags: ['autodocs', '!dev'],
  argTypes: {
    balance: {
      options: ['Penumbra balance', 'Account 2', 'Osmo balance'],
      mapping: {
        'Penumbra balance': PENUMBRA_BALANCE,
        'Account 2': PENUMBRA2_BALANCE,
        'Osmo balance': OSMO_BALANCE,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof WalletBalance>;

export const Basic: Story = {
  args: {
    balance: PENUMBRA_BALANCE,
  },
};
