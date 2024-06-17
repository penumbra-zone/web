import type { Meta, StoryObj } from '@storybook/react';
import { Network } from './network';

const meta: Meta<typeof Network> = {
  component: Network,
  title: 'Network',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Network>;

export const Basic: Story = {
  args: {
    name: 'penumbra-testnet-deimos-6',
    href: 'https://app.testnet.penumbra.zone',
  },
};
