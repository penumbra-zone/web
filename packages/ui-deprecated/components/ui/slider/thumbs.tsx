import * as SliderPrimitive from '@radix-ui/react-slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip';
import { ReactNode, useRef } from 'react';
import { TooltipPortal } from '@radix-ui/react-tooltip';

/**
 * Internal to `<Slider >`. Not intended to be used separately.
 */
export const Thumbs = ({
  value,
  thumbTooltip,
}: {
  value: number[];
  thumbTooltip?: boolean | ((value: number) => string);
}) =>
  value.map((thisValue, index) =>
    thumbTooltip ? (
      <ThumbWithTooltip key={index} value={thisValue} thumbTooltip={thumbTooltip} />
    ) : (
      <ThumbBase key={index} />
    ),
  );

const ThumbBase = ({ children }: { children?: ReactNode }) => (
  <SliderPrimitive.Thumb className='block size-5 cursor-pointer rounded-full border-2 border-secondary bg-background ring-offset-background transition-colors focus-visible:border-white focus-visible:outline-none focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'>
    {children}
  </SliderPrimitive.Thumb>
);

const ThumbWithTooltip = ({
  value,
  thumbTooltip,
}: {
  value: number;
  thumbTooltip?: boolean | ((value: number) => string);
}) => {
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <TooltipProvider>
      <Tooltip>
        {/* This is... weird. We have to put the `<TooltipTrigger />` inside the
        `<SliderPrimitive.Thumb />`, rather than vice versa, because the thumb
        is absolute-positioned. Reversing this hierarchy would cause weird
        layout glitches. */}
        <ThumbBase>
          <TooltipTrigger
            ref={triggerRef}
            // Negative margin to accommodate border
            className='ml-[-2px] mt-[-2px] size-5'
            // Prevent default so that it is not treated as a submit button when
            // inside a form
            onClick={e => e.preventDefault()}
          />
        </ThumbBase>

        <TooltipPortal>
          <TooltipContent
            // Keep the tooltip open while the user is clicking and dragging. See
            // https://github.com/radix-ui/primitives/blob/87bf377/packages/react/tooltip/src/Tooltip.stories.tsx#L659-L687
            onPointerDownOutside={e => e.target === triggerRef.current && e.preventDefault()}
          >
            {typeof thumbTooltip === 'function' ? thumbTooltip(value) : value}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
};
