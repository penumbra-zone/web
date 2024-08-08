import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { TextInput } from '.';

const meta: Meta<typeof TextInput> = {
  component: TextInput,
  tags: ['autodocs', '!dev'],
};
export default meta;

type Story = StoryObj<typeof TextInput>;

export const Basic: Story = {
  args: {
    actionType: 'default',
    placeholder: 'penumbra1abc123...',
    value: '',
    disabled: false,
    type: 'text',
  },

  render: function Render(props) {
    const [, updateArgs] = useArgs();

    const onChange = (value: string) => updateArgs({ value });

    return <TextInput {...props} onChange={onChange} />;
  },
};
