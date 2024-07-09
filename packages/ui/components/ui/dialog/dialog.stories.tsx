import type { Meta, StoryObj } from '@storybook/react';

import { Dialog, DialogHeader, DialogClose, DialogContent, DialogTrigger } from '.';
import { Button } from '../button';

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  title: 'Dialog',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Dialog>;

export const Full: Story = {
  args: {},
  render: args => {
    return (
      <Dialog {...args}>
        <DialogTrigger>
          <Button>Open dialog</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>Header here, which includes a built-in close button.</DialogHeader>
          <p>Content here</p>
          <DialogClose>
            <div>Clicking anything inside here will close the dialog.</div>
          </DialogClose>
        </DialogContent>
      </Dialog>
    );
  },
};
