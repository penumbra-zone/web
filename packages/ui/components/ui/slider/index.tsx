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
  /**
   * If set to `true`, will show a tooltip with the current value represented by
   * the thumb that the user's mouse is over. If set to a function, will call
   * that function with the current value, then use the returned string as the
   * tooltip content.
   */
  thumbTooltip?: boolean | ((value: number) => string);
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

const getSegmentCount = ({
  segmented,
  max,
  min,
  step,
}: PropsWithSegmented | PropsWithoutSegmented) => {
  if (!segmented) return 1;

  const rangeInclusive = max - min + 1;
  const rangeDividesEvenlyIntoStepSize = rangeInclusive % step === 0;

  if (!rangeDividesEvenlyIntoStepSize) return 1;

  const numberOfOptions = rangeInclusive / step;

  // Subtract 1 from the number of options, since the thumb can be on either
  // side of a segment, so there are 1 fewer segments than possible values.
  //
  // For example, imagine each dash in this range slider is a segment, and each
  // gap is the gap between segments:
  // |o- - - - | value: 0
  // | -o- - - | value: 1
  // | - -o- - | value: 2
  // | - - -o- | value: 3
  // | - - - -o| value: 4
  // The thumb (represented by the `o`) sits _in the gaps between segments_. In
  // the illustration above, the range of values is 0 (at the far left) to 4 (at
  // the far right), for a total of 5 possible values. Thus, we have 5 - 1 = 4
  // segments.
  const segmentCount = numberOfOptions - 1;

  return Math.max(segmentCount, 1);
};

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
 *   thumbTooltip={value => `Current value: ${value}`}
 * />
 * ```
 */
const Slider = (props: PropsWithSegmented | PropsWithoutSegmented) => {
  const { value, onValueChange, min, max, step, thumbTooltip } = props;

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
        {Array(getSegmentCount(props))
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
