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
    actionType: 'default',
    label: "Recipient's address",
    placeholder: 'penumbra1abc123...',
    value: '',
    disabled: false,
    helperText: 'The recipient can find their address via the Receive tab above.',
    type: 'text',
  },

  render: function Render(props) {
    const [, updateArgs] = useArgs();

    const onChange = (value: string) => updateArgs({ value });

    return <Input {...props} onChange={onChange} />;
  },
};
