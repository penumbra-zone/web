import { ArrowRightLeft, Send, Wallet } from 'lucide-react';
import { Meta, StoryObj } from '@storybook/react';

import { Icon } from '.';

const meta: Meta<typeof Icon> = {
  component: Icon,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div className='text-rust'>
        <Story />
      </div>
    ),
  ],
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
    color: 'var(--rust)',
  },
};
