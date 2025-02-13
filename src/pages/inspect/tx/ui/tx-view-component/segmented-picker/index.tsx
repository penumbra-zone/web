import { cn } from '../utils/cn';

export interface SegmentedPickerOption<ValueType> {
  /**
   * The value to pass to the `onChange` handler when clicked. Must be unique
   * across all segments, and must be either a string, number, or an object with
   * a `.toString()` method so that it can be used as a React key.
   */
  value: ValueType;
  label: string;
}

/**
 * Renders a segmented picker where only one option can be selected at a time.
 * Functionally equivalent to a `<select>` element or a set of radio buttons,
 * but looks nicer when you only have a few options to choose from. (Probably
 * shouldn't be used with more than 5 options.)
 *
 * @example
 * ```TSX
 * <SegmentedPicker
 *   value={value}
 *   onChange={setValue}
 *   options={[
 *     { value: 'one', label: 'One' },
 *     { value: 'two', label: 'Two' },
 *     { value: 'three', label: 'Three' },
 *   ]}
 * />
 * ```
 */
export const SegmentedPicker = <ValueType extends { toString: () => string }>({
  value,
  onChange,
  options,
}: {
  value: ValueType;
  onChange: (value: ValueType) => void;
  options: SegmentedPickerOption<ValueType>[];
  grow?: boolean;
  size?: 'md' | 'lg';
}) => {
  return (
    <div
      className='h-[52px] flex items-center justify-center rounded-md bg-black p-2 mx-auto mb-8 w-[100%]'
      role='radiogroup'
    >
      {options.map(option => (
        <button
          key={option.value.toString()}
          role='radio'
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex items-center justify-center text-sm font-bold rounded-sm flex-1 h-[38px]',
            value === option.value ? 'bg-secondary-main text-text-primary' : 'text-text-secondary',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
