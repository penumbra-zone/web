import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip } from '.';

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
  args: {
    title: 'This is a heading',
    message:
      'This is description information. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi.',
    children: 'Hover over this text.',
  },
};
