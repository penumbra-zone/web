import type { Meta, StoryObj } from '@storybook/react';

import { Display } from '.';
import { Text } from '../Text';

const meta: Meta<typeof Display> = {
  component: Display,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
  },
  decorators: [
    Story => (
      <div className='border border-solid border-base-white'>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Display>;

export const FullWidth: Story = {
  args: {
    children: (
      <div className='bg-base-white p-2 text-base-black'>
        <Text p>
          The white background that this text sits inside of represents the{' '}
          <Text strong>inside</Text> width of the <Text technical>&lt;Display /&gt;</Text>{' '}
          component. The white border to the left and right of this white bar represent the{' '}
          <Text strong>outside</Text> width of the <Text technical>&lt;Display /&gt;</Text>{' '}
          component.
        </Text>
        <Text p>
          You can resize your window to see how the margins at left and right change depending on
          the size of the browser window.
        </Text>
        <Text p>
          To test <Text technical>&lt;Display /&gt;</Text> at full width, click the &quot;Full
          Width&quot; item in the left sidebar, and try resizing your browser.
        </Text>
      </div>
    ),
  },
};
