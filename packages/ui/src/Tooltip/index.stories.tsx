import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip, TooltipProvider } from './index';
import { Text } from '../Text';

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  tags: ['autodocs', '!dev'],
  argTypes: {
    children: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Basic: Story = {
  render: args => (
    <TooltipProvider>
      <Tooltip {...args} />
    </TooltipProvider>
  ),
  args: {
    title: 'This is a heading',
    message:
      'This is description information. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi.',
    children: <Text color='text.primary'>Hover over this text.</Text>,
  },
};
