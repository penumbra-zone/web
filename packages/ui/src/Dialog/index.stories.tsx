import type { Meta, StoryObj } from '@storybook/react';

import { Dialog } from '.';
import { Button } from '../Button';
import { ComponentType } from 'react';

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  tags: ['autodocs', '!dev'],
  subcomponents: {
    // Re: type coercion, see
    // https://github.com/storybookjs/storybook/issues/23170#issuecomment-2241802787
    'Dialog.Content': Dialog.Content as ComponentType<unknown>,
    'Dialog.Trigger': Dialog.Trigger as ComponentType<unknown>,
  },
};
export default meta;

type Story = StoryObj<typeof Dialog>;

export const Basic: Story = {
  args: {},

  render: function Render() {
    return (
      <Dialog isOpen onClose={console.log}>
        <Dialog.Trigger asChild>
          <Button>Open dialog</Button>
        </Dialog.Trigger>

        <Dialog.Content title='Dialog title'>Dialog content</Dialog.Content>
      </Dialog>
    );
  },
};
