'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../../../lib/utils';
import { Thumbs } from './thumbs';

interface BaseProps {
  /**
   * Note that this is an array. You can pass more than one value to have
   * multiple draggable points on the slider.
   */
  value: number[];
  onValueChange: (value: number[]) => void;
  thumbTooltip?: boolean | ((value?: number) => string);
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
  thumbTooltip,
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

      <Thumbs value={value} thumbTooltip={thumbTooltip} />
    </SliderPrimitive.Root>
  );
};

export { Slider };
