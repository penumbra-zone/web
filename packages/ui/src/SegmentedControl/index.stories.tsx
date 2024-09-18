import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { SegmentedControl } from '.';

const OPTIONS = [
  { label: 'One', value: 'one' },
  { label: 'Two', value: 'two' },
  { label: 'Three', value: 'three' },
  { label: 'Four (disabled)', value: 'four', disabled: true },
];

const meta: Meta<typeof SegmentedControl> = {
  component: SegmentedControl,
  tags: ['autodocs', '!dev', 'density'],
  argTypes: {
    value: {
      control: 'select',
      options: OPTIONS.filter(({ disabled }) => !disabled).map(({ value }) => value),
    },
    options: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof SegmentedControl>;

export const Basic: Story = {
  args: {
    options: OPTIONS,
    value: 'one',
    disabled: false,
  },

  render: function Render(props) {
    const [, updateArgs] = useArgs();

    const onChange = (value: { toString: () => string }) => updateArgs({ value });

    return <SegmentedControl {...props} onChange={onChange} />;
  },
};
