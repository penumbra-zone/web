import { useId } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export interface SegmentedPickerOption<ValueType> {
  /**
   * The value to pass to the `onChange` handler when clicked. Must be unique
   * across all segments, and must be either a string, number, or an object with
   * a `.toString()` method so that it can be used as a React key.
   */
  value: ValueType;
  label: string;
}
const getRoundedClasses = (index: number, optionsLength: number, size: 'md' | 'lg') =>
  cn(
    index === 0 && size === 'md' && 'rounded-l-sm',
    index === optionsLength - 1 && size === 'md' && 'rounded-r-sm',
    index === 0 && size === 'lg' && 'rounded-l-lg',
    index === optionsLength - 1 && size === 'lg' && 'rounded-r-lg',
  );

const ActiveSegmentIndicator = ({
  layoutId,
  roundedClasses,
}: {
  layoutId: string;
  roundedClasses: string;
}) => (
  <motion.div
    layout
    layoutId={layoutId}
    className={cn('absolute inset-0 z-10 bg-teal', roundedClasses)}
  />
);

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
  grow = false,
  size = 'md',
}: {
  value: ValueType;
  onChange: (value: ValueType) => void;
  options: SegmentedPickerOption<ValueType>[];
  grow?: boolean;
  size?: 'md' | 'lg';
}) => {
  // Used by framer-motion to tie the active segment indicator together across
  // all segments.
  const layoutId = useId();

  return (
    <div className='flex flex-row gap-0.5' role='radiogroup'>
      {options.map((option, index) => (
        <div
          key={option.value.toString()}
          role='radio'
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'font-bold cursor-pointer relative bg-background items-center justify-center flex',
            getRoundedClasses(index, options.length, size),
            size === 'md' && 'text-sm px-3 h-8',
            size === 'lg' && 'px-4 h-10',
            value !== option.value && 'text-light-grey',
            grow && 'grow',
          )}
        >
          {value === option.value && (
            <ActiveSegmentIndicator
              layoutId={layoutId}
              roundedClasses={getRoundedClasses(index, options.length, size)}
            />
          )}

          <div className='absolute inset-0 z-20 flex items-center justify-center'>
            {option.label}
          </div>

          {/**
           * Render the label again underneath the absolute-positioned label,
           * since the absolute-positioned label has no effect on layout.
           */}
          {option.label}
        </div>
      ))}
    </div>
  );
};
