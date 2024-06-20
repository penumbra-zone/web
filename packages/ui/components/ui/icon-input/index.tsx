import { ReactNode } from 'react';
import { Input } from '../input';

/**
 * Use this to render an input with an icon to its left, such as a search field
 * with a magnifying glass.
 */
export const IconInput = ({
  value,
  onChange,
  icon,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  icon: ReactNode;
  placeholder?: string;
}) => {
  return (
    <div className='flex w-full items-center gap-2'>
      {icon}
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        variant='transparent'
        placeholder={placeholder}
      />
    </div>
  );
};
