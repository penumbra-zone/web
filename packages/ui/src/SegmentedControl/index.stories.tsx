import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { SegmentedControl } from '.';

const meta: Meta<typeof SegmentedControl> = {
  component: SegmentedControl,
  tags: ['autodocs', '!dev'],
};
export default meta;

type Story = StoryObj<typeof SegmentedControl>;

export const Basic: Story = {
  args: {
    options: [
      { label: 'One', value: 'one' },
      { label: 'Two', value: 'two' },
      { label: 'Three', value: 'three' },
      { label: 'Four (disabled)', value: 'four', disabled: true },
    ],
  },

  render: function Render({ value, options }) {
    const [, updateArgs] = useArgs();

    const onChange = (value: { toString: () => string }) => updateArgs({ value });

    return <SegmentedControl value={value} options={options} onChange={onChange} />;
  },
};
