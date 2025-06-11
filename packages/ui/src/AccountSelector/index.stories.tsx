import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { AccountSelector } from '.';

const meta: Meta<typeof AccountSelector> = {
  component: AccountSelector,
  tags: ['autodocs', '!dev', 'density'],
  parameters: {
    docs: {
      description: {
        component: `
The AccountSelector component provides an intuitive interface for navigating between account indexes. 
It combines a display field with previous/next navigation buttons in a compact form factor.

**Key Features:**
- Automatic boundary checking (prevents going below 0)
- Customizable display formatting
- Density support through context
- Keyboard and click navigation
- Proper disabled states
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'The current account index (0-based)',
    },
    canGoPrevious: {
      control: 'boolean',
      description: 'Whether navigation to previous account is allowed',
    },
    canGoNext: {
      control: 'boolean',
      description: 'Whether navigation to next account is allowed',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the entire component is disabled',
    },
    label: {
      control: 'text',
      description: 'Optional label for the input field',
    },
  },
};
export default meta;

type Story = StoryObj<typeof AccountSelector>;

export const Basic: Story = {
  args: {
    value: 0,
    canGoPrevious: true,
    canGoNext: true,
    disabled: false,
  },

  render: function Render(props) {
    const [, updateArgs] = useArgs();

    const onChange = (value: number) => updateArgs({ value });

    return <AccountSelector {...props} onChange={onChange} />;
  },
};

export const WithLabel: Story = {
  args: {
    value: 2,
    label: 'Select Account',
    canGoPrevious: true,
    canGoNext: true,
    disabled: false,
  },

  render: function Render(props) {
    const [, updateArgs] = useArgs();

    const onChange = (value: number) => updateArgs({ value });

    return <AccountSelector {...props} onChange={onChange} />;
  },
};

export const WithCustomDisplay: Story = {
  args: {
    value: 1,
    canGoPrevious: true,
    canGoNext: true,
    disabled: false,
  },

  render: function Render(props) {
    const [, updateArgs] = useArgs();

    const onChange = (value: number) => updateArgs({ value });
    const getDisplayValue = (index: number) => `Wallet ${index + 1}`;

    return <AccountSelector {...props} onChange={onChange} getDisplayValue={getDisplayValue} />;
  },
};

export const WithBoundaries: Story = {
  args: {
    value: 5,
    canGoPrevious: true,
    canGoNext: false,
    disabled: false,
    label: 'Account (max reached)',
  },

  render: function Render(props) {
    const [, updateArgs] = useArgs();

    const onChange = (value: number) => {
      // Simulate boundaries - max 5 accounts
      const newCanGoNext = value < 4;
      const newCanGoPrevious = value > 0;

      updateArgs({
        value,
        canGoNext: newCanGoNext,
        canGoPrevious: newCanGoPrevious,
      });
    };

    const getDisplayValue = (index: number) => `Account ${index} of 4`;

    return <AccountSelector {...props} onChange={onChange} getDisplayValue={getDisplayValue} />;
  },
};

export const Disabled: Story = {
  args: {
    value: 3,
    canGoPrevious: true,
    canGoNext: true,
    disabled: true,
    label: 'Disabled Account Selector',
  },

  render: function Render(props) {
    const [, updateArgs] = useArgs();

    const onChange = (value: number) => updateArgs({ value });

    return <AccountSelector {...props} onChange={onChange} />;
  },
};
