import { Meta, StoryObj } from '@storybook/react';
import { Slider } from './index';

const meta: Meta<typeof Slider> = {
  component: Slider,
  tags: ['autodocs', '!dev'],
};

export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: {
    min: 0,
    max: 10,
    step: 1,
    leftLabel: 'label',
    rightLabel: 'label',
    defaultValue: 5,
    showValue: true,
    showFill: true,
  },
};
