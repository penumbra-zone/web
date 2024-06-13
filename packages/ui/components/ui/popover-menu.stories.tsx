import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { PopoverMenu, PopoverMenuItem } from './popover-menu';
import { Button } from './button';

const meta: Meta<typeof PopoverMenu> = {
  component: PopoverMenu,
  title: 'PopoverMenu',
  tags: ['autodocs'],
  argTypes: {
    trigger: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof PopoverMenu>;

export const Basic: Story = {
  args: {
    items: [
      { label: 'Puppies', value: 'puppies' },
      { label: 'Kittens', value: 'kittens' },
      { label: 'Bunnies', value: 'bunnies' },
    ] satisfies PopoverMenuItem<string>[],
    value: 'puppies',
    trigger: <Button>Open popover menu</Button>,
  },

  render: function Render({ items, trigger, value }) {
    const [, updateArgs] = useArgs();

    return (
      <PopoverMenu
        items={items}
        value={value}
        onChange={value => updateArgs({ value })}
        trigger={trigger}
      />
    );
  },
};
