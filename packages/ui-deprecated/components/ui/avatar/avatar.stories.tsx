import type { Meta, StoryObj } from '@storybook/react';

import { Avatar, AvatarImage } from '.';

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  title: 'Avatar',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Avatar>;

const EXAMPLE_URL =
  'https://images.unsplash.com/photo-1473830394358-91588751b241?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

export const Full: Story = {
  args: {},
  render: args => {
    return (
      <Avatar {...args}>
        <AvatarImage src={EXAMPLE_URL} />
      </Avatar>
    );
  },
};
