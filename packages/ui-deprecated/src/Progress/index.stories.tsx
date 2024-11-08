import type { Meta, StoryObj } from '@storybook/react';

import { Progress } from '.';

const meta: Meta<typeof Progress> = {
  component: Progress,
  tags: ['autodocs', '!dev'],
};
export default meta;

type Story = StoryObj<typeof Progress>;

export const Basic: Story = {
  args: {
    value: 0.3,
    loading: false,
    error: false,
  },
};
