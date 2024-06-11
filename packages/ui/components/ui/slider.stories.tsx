import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { Slider } from './slider';

const meta: Meta<typeof Slider> = {
  component: Slider,
  title: 'Slider',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Slider>;

export const Basic: Story = {
  args: {
    max: 10,
    min: 1,
    step: 1,
    value: [1, 2],
    segmented: false,
  },

  render: function Render(props) {
    const [, updateArgs] = useArgs();

    const onValueChange = (value: number[]) => updateArgs({ value });

    return <Slider {...props} onValueChange={onValueChange} />;
  },
};
