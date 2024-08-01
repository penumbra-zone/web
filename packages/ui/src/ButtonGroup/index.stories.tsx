import type { Meta, StoryObj } from '@storybook/react';

import { ButtonGroup } from '.';
import { Ban, HandCoins, Send } from 'lucide-react';

const meta: Meta<typeof ButtonGroup> = {
  component: ButtonGroup,
  tags: ['autodocs', '!dev', 'density'],
  argTypes: {
    buttons: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof ButtonGroup>;

export const Basic: Story = {
  args: {
    actionType: 'default',
    iconOnly: false,
    column: false,
    buttons: [
      {
        label: 'Delegate',
        icon: Send,
      },
      {
        label: 'Undelegate',
        icon: HandCoins,
      },
      {
        label: 'Cancel',
        icon: Ban,
      },
    ],
  },
};
