import type { Meta, StoryObj } from '@storybook/react';

import { Pill } from '.';

const meta: Meta<typeof Pill> = {
  component: Pill,
  tags: ['autodocs', '!dev'],
};
export default meta;

type Story = StoryObj<typeof Pill>;

export const Basic: Story = {
  args: {
    children: 'Pill',
    size: 'sparse',
    priority: 'primary',
  },
};
