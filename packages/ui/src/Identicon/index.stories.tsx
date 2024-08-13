import type { Meta, StoryObj } from '@storybook/react';

import { Identicon } from '.';

const meta: Meta<typeof Identicon> = {
  component: Identicon,
  tags: ['autodocs', '!dev'],
};
export default meta;

type Story = StoryObj<typeof Identicon>;

export const Basic: Story = {
  args: {
    uniqueIdentifier: 'abc123',
    type: 'solid',
    size: 24,
  },
};
