import type { Meta, StoryObj } from '@storybook/react';
import { PortfolioBalance } from '.';

const meta = {
  title: 'Components/PortfolioBalance',
  component: PortfolioBalance,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PortfolioBalance>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    balance: '4,567.678',
    currency: 'USDC',
  },
};

export const WithOnInfoClick: Story = {
  args: {
    balance: '4,567.678',
    currency: 'USDC',
  },
}; 