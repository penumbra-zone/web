import { Meta, StoryObj } from '@storybook/react';

import { Pagination } from '.';
import { useState } from 'react';

const meta: Meta<typeof Pagination> = {
  component: Pagination,
  tags: ['autodocs', '!dev'],
};

export default meta;

const ArrayList = ({ array }: { array: number[] }) => {
  if (array.length < 10) {
    return (
      <ol className='text-text-secondary'>
        {array.map(v => (
          <li className='text-xs' key={v}>
            {v}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className='text-text-secondary'>
      {array.slice(0, 3).map(v => (
        <li className='text-xs' key={v}>
          {v}
        </li>
      ))}
      <li key='...' className='text-xs'>
        ...
      </li>
      {array.slice(-3).map(v => (
        <li className='text-xs' key={v}>
          {v}
        </li>
      ))}
    </ol>
  );
};

export const Basic: StoryObj<typeof Pagination> = {
  render: args => {
    const [value, setValue] = useState(args.value);
    const [limit, setLimit] = useState<number>(args.limit);

    const array = Array.from({ length: 305 }, (_, i) => i + 1);
    const values = array.slice(limit * (value - 1), limit * value);

    const onLimit = (limit: number) => {
      setLimit(limit);
      setValue(1);
    };

    return (
      <div className='flex flex-col gap-2'>
        <Pagination
          {...args}
          totalItems={array.length}
          value={value}
          onChange={setValue}
          limit={limit}
          onLimitChange={onLimit}
        />
        <ArrayList array={values} />
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
    const array = Array.from({ length: 305 }, (_, i) => i + 1);
    const values = array.slice(limit * (value - 1), limit * value);

    return (
      <div className='flex flex-col gap-2'>
        <Pagination
          {...args}
          totalItems={array.length}
          value={value}
          onChange={setValue}
          limit={limit}
        />
        <ArrayList array={values} />
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
