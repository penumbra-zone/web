import type { Meta, StoryObj } from '@storybook/react';

import { SegmentedControl } from '.';
import { ComponentType, useState } from 'react';

const meta: Meta<typeof SegmentedControl> = {
  component: SegmentedControl,
  tags: ['autodocs', '!dev', 'density'],
  argTypes: {},
  subcomponents: {
    'SegmentedControl.Item': SegmentedControl.Item as ComponentType<unknown>,
  },
};
export default meta;

type Story = StoryObj<typeof SegmentedControl>;

export const Basic: Story = {
  args: {
    value: 'one',
  },

  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return (
      <SegmentedControl {...args} value={value} onChange={setValue}>
        <SegmentedControl.Item value='one' />
        <SegmentedControl.Item value='two' />
        <SegmentedControl.Item value='three' />
      </SegmentedControl>
    );
  },
};

export const Colorful: Story = {
  args: {
    value: 'three',
  },

  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return (
      <SegmentedControl {...args} value={value} onChange={setValue}>
        <SegmentedControl.Item value='one' style='unfilled' />
        <SegmentedControl.Item value='two' style='filled' />
        <SegmentedControl.Item value='three' style='red' />
        <SegmentedControl.Item value='four' style='green' />
        <SegmentedControl.Item value='five' style='unfilled' />
      </SegmentedControl>
    );
  },
};

export const Disabled: Story = {
  args: {
    value: 'three',
  },

  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return (
      <SegmentedControl {...args} value={value} onChange={setValue}>
        <SegmentedControl.Item value='one' style='unfilled' disabled />
        <SegmentedControl.Item value='two' style='filled' disabled />
        <SegmentedControl.Item value='three' style='red' disabled />
        <SegmentedControl.Item value='four' style='green' />
        <SegmentedControl.Item value='five' style='unfilled' />
      </SegmentedControl>
    );
  },
};
