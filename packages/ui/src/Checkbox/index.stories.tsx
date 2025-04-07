import { Meta, StoryObj } from '@storybook/react';

import { Checkbox, CheckboxProps } from '.';
import { useState } from 'react';

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  tags: ['autodocs', '!dev'],
};

export default meta;

export const Single: StoryObj<typeof Checkbox> = {
  render: args => {
    const [value, setValue] = useState<CheckboxProps['checked']>('indeterminate');

    return (
      <div className='p-4'>
        <Checkbox {...args} checked={value} onChange={setValue} />
      </div>
    );
  },
  args: {
    title: 'Checkbox Text',
    description: 'This is a checkbox description.',
  },
};
