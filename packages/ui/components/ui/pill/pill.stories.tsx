import type { Meta, StoryObj } from '@storybook/react';

import { Pill } from '.';

const meta: Meta<typeof Pill> = {
  component: Pill,
  title: 'Pill',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Pill>;

export const Basic: Story = {
  args: {
    children: 'Pill',
  },
};

export const Dashed: Story = {
  args: {
    children: 'Pill',
    variant: 'dashed',
  },
};
