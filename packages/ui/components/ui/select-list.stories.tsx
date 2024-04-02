import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { SelectList } from './select-list';
import { ComponentProps } from 'react';

const meta: Meta<typeof SelectList> = {
  component: SelectList,
  title: 'SelectList',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof SelectList>;

export const Basic: Story = {
  render: function Render() {
    const [args, updateArgs] = useArgs<ComponentProps<(typeof SelectList)['Option']>>();

    const onChange = (value: unknown) => updateArgs({ value });

    const options = [
      { value: 'one', label: 'One', secondaryText: 'AKA, 1' },
      { value: 'two', label: 'Two', secondaryText: 'AKA, 2' },
      { value: 'three', label: 'Three', secondaryText: 'AKA, 3' },
    ];

    return (
      <SelectList>
        {options.map(option => (
          <SelectList.Option
            key={option.value}
            value={option.value}
            label={option.label}
            secondaryText={option.secondaryText}
            isSelected={!args.value ? option.value === 'one' : args.value === option.value}
            onSelect={onChange}
          />
        ))}
      </SelectList>
    );
  },
};
