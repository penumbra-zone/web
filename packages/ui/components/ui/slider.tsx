'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../../lib/utils';

interface BaseProps {
  /**
   * Note that this is an array. You can pass more than one value to have
   * multiple draggable points on the slider.
   */
  value: number[];
  onValueChange: (value: number[]) => void;
}

// When `segmented` is `true`, the other props are required.
interface PropsWithSegmented extends BaseProps {
  /** Segment the slider at each step */
  segmented: true;
  min: number;
  max: number;
  /** The step size to count by */
  step: number;
}

interface PropsWithoutSegmented extends BaseProps {
  /** Segment the slider at each step */
  segmented?: false;
  min?: number;
  max?: number;
  /** The step size to count by */
  step?: number;
}

/**
 * Renders a draggable range slider:
 * |---o-------------|
 *
 * @example
 * ```tsx
 * <Slider
 *   min={0}
 *   max={10}
 *   step={2}
 *   value={value}
 *   onValueChange={onValueChange}
 *   segmented // to show gaps in the slider for each option
 * />
 * ```
 */
const Slider = ({
  segmented,
  value,
  onValueChange,
  min,
  max,
  step,
}: PropsWithSegmented | PropsWithoutSegmented) => {
  const segmentCount =
    !!segmented && (max - min + 1) % step === 0 ? Math.max((max - min + 1) / step - 1, 1) : 1;

  return (
    <SliderPrimitive.Root
      className={'relative flex w-full touch-none select-none items-center'}
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
    >
      {/* We include `px-2` in the wrapper div so that the thumb is centered on
      the gaps */}
      <div className='flex h-2 w-full gap-1 px-2'>
        {Array(segmentCount)
          .fill(null)
          .map((_, index, array) => (
            <SliderPrimitive.Track
              key={index}
              className={cn(
                'relative block h-2 w-full overflow-hidden bg-secondary',
                index === 0 && 'rounded-l-full',
                index === array.length - 1 && 'rounded-r-full',
              )}
            />
          ))}
      </div>

      {Array(value.length)
        .fill(null)
        .map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className='block size-5 rounded-full border-2 border-secondary bg-background ring-offset-background transition-colors focus-visible:border-white focus-visible:outline-none focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
          />
        ))}
    </SliderPrimitive.Root>
  );
};

export { Slider };
