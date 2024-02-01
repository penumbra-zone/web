import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { SegmentedPicker } from './segmented-picker';

const meta: Meta<typeof SegmentedPicker> = {
  component: SegmentedPicker,
  title: 'SegmentedPicker',
  tags: ['autodocs'],
  argTypes: {
    options: {
      control: false,
    },
  },
};
export default meta;

type Story = StoryObj<typeof SegmentedPicker>;

export const Basic: Story = {
  args: {
    value: 'one',
  },

  render: function Render({ value }) {
    const [, updateArgs] = useArgs();

    const onChange = (value: unknown) => updateArgs({ value });

    const options = [
      { value: 'one', label: 'One' },
      { value: 'two', label: 'Two' },
      { value: 'three', label: 'Three' },
    ];

    return <SegmentedPicker value={value} onChange={onChange} options={options} />;
  },
};
