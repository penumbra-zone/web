import type { Meta, StoryObj } from '@storybook/react';

import { Skeleton } from '.';
import { Text } from '../Text';

const meta: Meta<typeof Skeleton> = {
  component: Skeleton,
  tags: ['autodocs', '!dev'],
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Basic: Story = {
  args: {},
  render: function Render(props) {
    return (
      <>
        <Text color='text.primary'>Resize me</Text>
        <div className='h-20 w-60 resize overflow-auto'>
          <Skeleton {...props} />
        </div>
      </>
    );
  },
};
