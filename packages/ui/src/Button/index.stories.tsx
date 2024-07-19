import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '.';
import { ArrowLeftRight, Check } from 'lucide-react';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs', '!dev'],
  argTypes: {
    icon: {
      control: 'select',
      options: ['None', 'Check', 'ArrowLeftRight'],
      mapping: { None: undefined, Check, ArrowLeftRight },
    },
    onClick: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Basic: Story = {
  args: {
    size: 'sparse',
    children: 'Save',
    actionType: 'default',
    variant: 'primary',
    disabled: false,
    icon: Check,
    iconOnly: false,
  },
};
