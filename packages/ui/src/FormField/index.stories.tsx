import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from '.';
import { TextInput } from '../TextInput';
import { useState } from 'react';
import { SegmentedControl } from '../SegmentedControl';

const meta: Meta<typeof FormField> = {
  component: FormField,
  tags: ['autodocs', '!dev'],
  argTypes: {
    children: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof FormField>;

export const TextInputExample: Story = {
  args: {
    label: "Recipient's address",
    helperText: 'The recipient can find their address via the Receive tab.',
    disabled: false,
  },

  render: function Render(props) {
    const [recipient, setRecipient] = useState('');

    return (
      <FormField {...props}>
        <TextInput value={recipient} onChange={setRecipient} placeholder='penumbra1abc123...' />
      </FormField>
    );
  },
};

export const SegmentedControlExample: Story = {
  args: {
    label: 'Fee Tier',
    disabled: false,
  },

  render: function Render(props) {
    const [feeTier, setFeeTier] = useState('low');

    return (
      <FormField {...props}>
        <SegmentedControl
          value={feeTier}
          options={[
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
          ]}
          onChange={setFeeTier}
        />
      </FormField>
    );
  },
};
