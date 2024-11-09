import type { Meta, StoryObj } from '@storybook/react';

import { Box } from '.';

const meta: Meta<typeof Box> = {
  component: Box,
  title: 'Box',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Box>;

export const Basic: Story = {
  args: {
    children: 'Box',
  },
};

export const WithLabel: Story = {
  args: {
    children: 'Box',
    label: 'Label',
    headerContent: 'Header content',
  },
};

export const SpacingCompact: Story = {
  args: {
    children: 'Box',
    spacing: 'compact',
  },
};

export const RedBorder: Story = {
  args: {
    children: 'Box',
    state: 'error',
  },
};
