'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';

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
 * />
 * ```
 */
const Slider = (props: {
  min?: number;
  max?: number;
  /** The step size to count by */
  step?: number;
  /**
   * Note that this is an array. You can pass more than one value to have
   * multiple draggable points on the slider.
   */
  value: number[];
  onValueChange: (value: number[]) => void;
}) => (
  <SliderPrimitive.Root
    className={'relative flex w-full touch-none select-none items-center'}
    {...props}
  >
    <SliderPrimitive.Track className='relative h-2 w-full grow overflow-hidden rounded-full bg-secondary'>
      <SliderPrimitive.Range className='absolute h-full bg-secondary' />
    </SliderPrimitive.Track>
    {Array(props.value.length)
      .fill(null)
      .map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className='block size-5 rounded-full border-2 border-secondary bg-background ring-offset-background transition-colors focus-visible:border-white focus-visible:outline-none focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
        />
      ))}
  </SliderPrimitive.Root>
);

export { Slider };
