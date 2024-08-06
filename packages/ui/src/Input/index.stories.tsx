import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { Input } from '.';

const meta: Meta<typeof Input> = {
  component: Input,
  tags: ['autodocs', '!dev'],
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Basic: Story = {
  args: {
    label: 'Label',
    placeholder: 'Enter text here...',
    value: '',
  },

  render: function Render({ label, value, placeholder }) {
    const [, updateArgs] = useArgs();

    const onChange = (value: string) => updateArgs({ value });

    return <Input label={label} value={value} onChange={onChange} placeholder={placeholder} />;
  },
};
