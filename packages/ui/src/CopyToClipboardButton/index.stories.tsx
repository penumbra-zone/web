import type { Meta, StoryObj } from '@storybook/react';

import { CopyToClipboardButton } from '.';
import { Density } from '../Density';

const meta: Meta<typeof CopyToClipboardButton> = {
  component: CopyToClipboardButton,
  tags: ['autodocs', '!dev', 'density'],
};
export default meta;

type Story = StoryObj<typeof CopyToClipboardButton>;

export const Basic: Story = {
  args: {
    text: 'This is sample text copied by the PenumbraUI <CopyToClipboardButton /> component.',
    disabled: false,
  },
};

/**
 * The button size is automatically controlled by the density context.
 * This story shows the component in different density contexts.
 */
export const DensityVariants: Story = {
  render: args => (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='text-text-secondary text-sm w-16'>Sparse:</span>
        <Density sparse>
          <CopyToClipboardButton {...args} />
        </Density>
      </div>

      <div className='flex items-center gap-2'>
        <span className='text-text-secondary text-sm w-16'>Compact:</span>
        <Density compact>
          <CopyToClipboardButton {...args} />
        </Density>
      </div>

      <div className='flex items-center gap-2'>
        <span className='text-text-secondary text-sm w-16'>Slim:</span>
        <Density slim>
          <CopyToClipboardButton {...args} />
        </Density>
      </div>
    </div>
  ),

  args: {
    text: 'Sample text to copy',
  },

  parameters: {
    docs: {
      description: {
        story:
          'The button automatically adapts its size based on the density context. Use the `<Density />` component to control the button size.',
      },
    },
  },
};
