import type { Meta, StoryObj } from '@storybook/react';

import { Toggle } from '.';

const meta: Meta<typeof Toggle> = {
  component: Toggle,
  tags: ['autodocs', '!dev', 'density'],
  argTypes: {
    state: {
      control: { type: 'select' },
      options: ['default', 'focused'],
    },
    label: {
      description: 'Accessibility label (not visible, used for screen readers)',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Toggle>;

export const Basic: Story = {
  args: {
    defaultSelected: false,
    label: 'Toggle switch',
    disabled: false,
    onChange: (selected: boolean) => console.log('Toggle changed to:', selected),
  },
};

export const Selected: Story = {
  args: {
    defaultSelected: true,
    label: 'Toggle switch',
    onChange: (selected: boolean) => console.log('Toggle changed to:', selected),
  },
};

export const Focused: Story = {
  args: {
    defaultSelected: false,
    label: 'Toggle switch',
    state: 'focused',
    onChange: (selected: boolean) => console.log('Toggle changed to:', selected),
  },
};

export const FocusedSelected: Story = {
  args: {
    defaultSelected: true,
    label: 'Toggle switch',
    state: 'focused',
    onChange: (selected: boolean) => console.log('Toggle changed to:', selected),
  },
};

export const Disabled: Story = {
  args: {
    defaultSelected: false,
    label: 'Toggle switch',
    disabled: true,
    onChange: (selected: boolean) => console.log('Toggle changed to:', selected),
  },
};
