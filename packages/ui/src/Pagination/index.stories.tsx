import { Meta, StoryObj } from '@storybook/react';

import { Pagination } from '.';
import { useState } from 'react';

const meta: Meta<typeof Pagination> = {
  component: Pagination,
  tags: ['autodocs', '!dev'],
};

export default meta;

export const Basic: StoryObj<typeof Pagination> = {
  render: args => {
    const [value, setValue] = useState(args.value);
    const [limit, setLimit] = useState<number>(args.limit);

    const array = Array.from({ length: 300 }, (_, i) => i + 1);
    const values = array.slice(limit * (value - 1), limit * value);
    const pages = Math.ceil(array.length / limit);

    const onLimit = (limit: number) => {
      setLimit(limit);
      setValue(1);
    };

    return (
      <div className='flex flex-col gap-2'>
        <Pagination
          {...args}
          pages={pages}
          value={value}
          onChange={setValue}
          limit={args.limit}
          onLimitChange={onLimit}
        />

        <ol className='text-text-secondary'>
          {values.slice(0, 3).map(v => (
            <li className='text-xs' key={v}>
              {v}
            </li>
          ))}
          <li key='...' className='text-xs'>
            ...
          </li>
          {values.slice(-3).map(v => (
            <li className='text-xs' key={v}>
              {v}
            </li>
          ))}
        </ol>
      </div>
    );
  },
  args: {
    value: 1,
    limit: 30,
  },
};

export const Short: StoryObj<typeof Pagination> = {
  render: args => {
    const [value, setValue] = useState(args.value);

    const limit = args.limit;
    const array = Array.from({ length: 300 }, (_, i) => i + 1);
    const values = array.slice(limit * (value - 1), limit * value);
    const pages = Math.ceil(array.length / limit);

    return (
      <div className='flex flex-col gap-2'>
        <Pagination {...args} pages={pages} value={value} onChange={setValue} limit={limit} />

        <ol className='text-text-secondary'>
          {values.slice(0, 3).map(v => (
            <li className='text-xs' key={v}>
              {v}
            </li>
          ))}
          <li key='...' className='text-xs'>
            ...
          </li>
          {values.slice(-3).map(v => (
            <li className='text-xs' key={v}>
              {v}
            </li>
          ))}
        </ol>
      </div>
    );
  },
  args: {
    value: 1,
    limit: 30,
    hideLimitSelector: true,
    hidePageButtons: true,
    hidePageInfo: true,
  },
};
