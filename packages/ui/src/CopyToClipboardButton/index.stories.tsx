import type { Meta, StoryObj } from '@storybook/react';

import { CopyToClipboardButton } from '.';

const meta: Meta<typeof CopyToClipboardButton> = {
  component: CopyToClipboardButton,
  tags: ['autodocs', '!dev'],
};
export default meta;

type Story = StoryObj<typeof CopyToClipboardButton>;

export const Basic: Story = {
  args: {
    text: 'This is sample text copied by the PenumbraUI <CopyToClipboardButton /> component.',
    disabled: false,
  },
};
