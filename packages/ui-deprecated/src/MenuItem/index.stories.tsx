import type { Meta, StoryObj } from '@storybook/react';

import { MenuItem } from '.';
import { ArrowLeftRight, Check, Copy } from 'lucide-react';

const meta: Meta<typeof MenuItem> = {
  component: MenuItem,
  tags: ['autodocs', '!dev'],
  argTypes: {
    icon: {
      control: 'select',
      options: ['None', 'Copy', 'Check', 'ArrowLeftRight'],
      mapping: { None: undefined, Copy, Check, ArrowLeftRight },
    },
    label: {
      type: 'string',
    },
    onClick: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof MenuItem>;

export const Basic: Story = {
  args: {
    label: 'Menu Item',
    icon: Check,
    disabled: false,
  },
};
