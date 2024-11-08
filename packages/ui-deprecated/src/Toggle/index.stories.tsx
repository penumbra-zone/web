import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { Toggle } from '.';

const meta: Meta<typeof Toggle> = {
  component: Toggle,
  tags: ['autodocs', '!dev', 'density'],
};
export default meta;

type Story = StoryObj<typeof Toggle>;

export const Basic: Story = {
  args: {
    value: false,
    label: 'Label',
    disabled: false,
  },

  render: function Render(props) {
    const [, updateArgs] = useArgs();

    const onChange = (value: boolean) => updateArgs({ value });

    return <Toggle {...props} onChange={onChange} />;
  },
};
