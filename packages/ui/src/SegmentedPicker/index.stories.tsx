import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { SegmentedPicker } from '.';

const meta: Meta<typeof SegmentedPicker> = {
  component: SegmentedPicker,
  title: 'SegmentedPicker',
  tags: ['autodocs', '!dev'],
  argTypes: {
    value: { control: false },
    options: { control: false },
    onChange: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof SegmentedPicker>;

export const Basic: Story = {
  args: {
    actionType: 'default',
    value: 'first',
    options: [
      { label: 'First', value: 'first' },
      { label: 'Second', value: 'second' },
      { label: 'Third', value: 'third' },
      { label: 'Fourth (disabled)', value: 'fourth', disabled: true },
    ],
  },

  render: function Render(props) {
    const [, updateArgs] = useArgs();

    const onChange = (value: { toString: () => string }) => updateArgs({ value });

    return <SegmentedPicker {...props} onChange={onChange} />;
  },
};
