import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '.';
import { ArrowLeftRight, Check } from 'lucide-react';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs', '!dev', 'density'],
  argTypes: {
    icon: {
      control: 'select',
      options: ['None', 'Check', 'ArrowLeftRight'],
      mapping: { None: undefined, Check, ArrowLeftRight },
    },
    iconOnly: {
      options: ['true', 'false', 'adornment'],
      mapping: { true: true, false: false, adornment: 'adornment' },
    },
    onClick: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Basic: Story = {
  args: {
    children: 'Save',
    actionType: 'default',
    disabled: false,
    icon: Check,
    iconOnly: false,
    type: 'button',
  },
};
