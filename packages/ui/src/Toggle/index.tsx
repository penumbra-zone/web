import cn from 'clsx';
import { useCallback, useState } from 'react';
import { useDisabled } from '../utils/disabled-context';
import { useDensity, Density } from '../utils/density';

export interface ToggleProps {
  /** An accessibility label. */
  label: string;
  /** Initial selected state */
  defaultSelected?: boolean;
  /** Callback when the toggle state changes */
  onChange?: (selected: boolean) => void;
  /** @todo: Implement disabled state visually. */
  disabled?: boolean;
  /** Density variant - if not provided, uses context density */
  density?: Density;
  /** The visual state of the toggle */
  state?: 'default' | 'focused';
}

export const Toggle = ({
  label,
  defaultSelected = false,
  onChange,
  disabled,
  density: densityProp,
  state = 'default',
}: ToggleProps) => {
  const [selected, setSelected] = useState(defaultSelected);
  const contextDensity = useDensity();
  const density = densityProp ?? contextDensity;

  const getSizeClasses = (density: Density) => {
    if (density === 'compact') {
      return {
        container: 'w-8 h-4', // 32x16px
        handle: 'w-3.5 h-3.5', // 14x14px
      };
    }
    // sparse density
    return {
      container: 'w-12 h-6', // 48x24px
      handle: 'w-5 h-5', // 20px (closest to 22px)
    };
  };

  const { container, handle } = getSizeClasses(density);

  const isDisabled = useDisabled(disabled);

  const handleToggle = useCallback(
    (_e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        return;
      }
      const newSelected = !selected;
      setSelected(newSelected);
      onChange?.(newSelected);
    },
    [onChange, selected, isDisabled],
  );

  return (
    <div className='relative inline-flex'>
      <button
        type='button'
        aria-label={label}
        aria-pressed={selected}
        disabled={isDisabled}
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={e => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleToggle(e);
          }
        }}
        className={cn(
          'rounded-full transition-all cursor-pointer relative inline-flex items-center',
          'overflow-hidden',
          // Border styling based on focus and selected state
          // When focused but not selected: 2px border using same color as normal state
          state === 'focused' && !selected && 'border-2 border-other-tonalStroke',
          // When focused and selected: ring in primary color
          state === 'focused' &&
            selected &&
            'ring-2 ring-primary-main outline-1 outline-other-tonalStroke',
          // When not focused: just 1px border (no outline)
          state !== 'focused' && 'border border-other-tonalStroke',
          container,
          // Background color matches Figma specs
          selected ? 'bg-primary-main' : 'bg-transparent',
          // Position the handle
          selected ? 'justify-end' : 'justify-start',
          // Focus states for keyboard navigation
          'focus:outline-none',
          'focus-visible:ring-2 focus-visible:ring-primary-main',
          isDisabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {/* Handle/Dot */}
        <div
          className={cn(
            'rounded-full transition-all duration-200 ease-in-out shrink-0',
            // Handle colors matching Figma design
            selected ? 'bg-white' : 'bg-gray-400',
            handle,
            // Add minimal margin for proper positioning inside the container (1px gap like Figma)
            'm-px',
          )}
        />

        {/* Disabled overlay */}
        {isDisabled && (
          <div
            className={cn('absolute inset-0 rounded-full', 'bg-black bg-opacity-60', container)}
          />
        )}
      </button>
    </div>
  );
};
