import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '.';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Button',
  tags: ['autodocs', '!dev'],
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Basic: Story = {
  args: {
    size: 'sparse',
    children: 'Save',
    variant: 'primary',
    subvariant: 'filled',
    disabled: false,
  },
};
