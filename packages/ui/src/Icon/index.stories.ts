import { ArrowRightLeft, Send, Wallet } from 'lucide-react';
import { Meta, StoryObj } from '@storybook/react';

import { Icon } from '.';

const meta: Meta<typeof Icon> = {
  component: Icon,
  tags: ['autodocs', '!dev'],
  argTypes: {
    IconComponent: {
      options: ['ArrowRightLeft', 'Send', 'Wallet'],
      mapping: { ArrowRightLeft, Send, Wallet },
    },
  },
};

export default meta;

export const Basic: StoryObj<typeof Icon> = {
  args: {
    IconComponent: ArrowRightLeft,
    size: 'sm',
    color: theme => theme.color.text.primary,
  },
};
