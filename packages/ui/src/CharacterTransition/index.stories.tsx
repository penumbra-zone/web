import type { Meta, StoryObj } from '@storybook/react';
import { CharacterTransition } from '.';

const meta: Meta<typeof CharacterTransition> = {
  component: CharacterTransition,
  tags: ['autodocs', '!dev'],
  argTypes: {
    children: {
      control: 'select',
      options: [
        'The quick brown fox jumps over the lazy dog.',
        'Pack my box with five dozen liquor jugs.',
        'The five boxing wizards jump quickly.',
        'How vexingly quick daft zebras jump!',
        'By Jove, my quick study of lexicography won a prize!',
      ],
    },
  },
};
export default meta;

type Story = StoryObj<typeof CharacterTransition>;

export const Basic: Story = {
  args: {
    children: 'The quick brown fox jumps over the lazy dog.',
  },
};
