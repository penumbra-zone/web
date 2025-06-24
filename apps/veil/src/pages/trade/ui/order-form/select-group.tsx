import React from 'react';
import { Text } from '@penumbra-zone/ui/Text';
import cn from 'clsx';

export const SelectGroup: React.FC<{
  value?: string | number;
  options: string[];
  onChange: (option: string) => void;
}> = ({ value, options, onChange }) => {
  return (
    <div className='mb-4 flex gap-1'>
      {options.map(option => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            'rounded-lg border border-other-tonal-stroke px-2',
            value === option ? 'text-text-primary' : 'text-text-secondary',
            value === option && 'bg-neutral-main text-text-primary',
          )}
        >
          <Text small>{option}</Text>
        </button>
      ))}
    </div>
  );
};
