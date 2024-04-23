import { ReactNode } from 'react';
import { Input } from './input';

const className = 'flex w-full gap-2 rounded-lg border bg-background px-3 py-2';

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
    <div className={className}>
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
