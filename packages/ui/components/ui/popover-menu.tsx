import { ReactNode } from 'react';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from './popover';
import { Check } from 'lucide-react';

export interface PopoverMenuItem<ValueType extends { toString: () => string }> {
  label: string;
  value: ValueType;
}

/**
 * A popover that contains a menu.
 *
 * @example
 * ```tsx
 * <PopoverMenu
 *   items={filterOptions}
 *   value={filter}
 *   onChange={setFilter}
 *   trigger={<ListFilter size={16} />}
 * />
 * ```
 */
export const PopoverMenu = <ValueType extends { toString: () => string }>({
  items,
  value,
  onChange,
  trigger,
}: {
  items: PopoverMenuItem<ValueType>[];
  value: ValueType;
  onChange: (newValue: ValueType) => void;
  trigger: ReactNode;
}) => {
  return (
    <Popover>
      <PopoverTrigger>{trigger}</PopoverTrigger>

      <PopoverContent>
        <div className='flex flex-col gap-2'>
          {items.map(item => (
            <PopoverClose key={item.value.toString()}>
              <div
                role='button'
                onClick={() => onChange(item.value)}
                className='flex items-center gap-2'
              >
                {value === item.value ? <Check size={16} /> : <div className='size-4' />}
                {item.label}
              </div>
            </PopoverClose>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
