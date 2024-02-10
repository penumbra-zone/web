import type { Meta, StoryObj } from '@storybook/react';

import { Toaster } from './sonner';
import { toast } from 'sonner';
import { Button } from './button';

const meta: Meta<typeof Toaster> = {
  component: Toaster,
  title: 'Toaster',
  tags: ['autodocs'],
  decorators: [
    Story => (
      <>
        <Button className='w-[200px]' onClick={() => toast('Hear, hear!')}>
          Open a toast
        </Button>

        <Story />
      </>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Toaster>;

export const Basic: Story = {
  args: {},
};
