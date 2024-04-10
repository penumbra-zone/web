import type { Meta, StoryObj } from '@storybook/react';
import { Network } from './network';

const meta: Meta<typeof Network> = {
  component: Network,
  title: 'Network',
  tags: ['autodocs'],
  argTypes: {},
};
export default meta;

type Story = StoryObj<typeof Network>;

export const Basic: Story = {
  args: {
    name: 'penumbra-testnet-deimos-6',
    connectIndicator: true,
    href: 'https://app.testnet.penumbra.zone',
  },
};
