import { cn } from '../../lib/utils';

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
}) => {
  return (
    <div className='flex flex-row gap-0.5'>
      {options.map((option, index) => (
        <div
          key={option.value.toString()}
          role='button'
          onClick={() => onChange(option.value)}
          className={cn(
            'px-3 py-1',
            index === 0 && 'rounded-l-sm',
            index === options.length - 1 && 'rounded-r-sm',
            value === option.value && 'bg-teal-800',
            value !== option.value && 'text-teal',
            value !== option.value && 'bg-light-brown',
          )}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
};
