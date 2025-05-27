import React, { useEffect, useRef, useState } from 'react';
import cn from 'clsx';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { Text } from '@penumbra-zone/ui';
import { round } from '@penumbra-zone/types/round';

interface ThumbProps {
  left?: boolean;
  right?: boolean;
  value: [number, number];
  scale: ScaleLinear<number, number>;
  max: number;
  onMove: (value: [number, number]) => void;
}

interface ControlSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onInput: (value: [number, number]) => void;
}

interface DeltaState {
  initX: number;
  deltaX: number;
}

const Thumb: React.FC<ThumbProps> = ({ left, right, value, scale, max, onMove }) => {
  const deltaRef = useRef<DeltaState | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [textWidth, setTextWidth] = useState(0);
  console.log('TCL: textWidth', textWidth);

  useEffect(() => {
    requestAnimationFrame(() => {
      // useComponentSize doesnt set width correctly on updates
      setTextWidth(textRef.current?.offsetWidth ?? 0);
    });
  }, [value]);

  const handleMouseMove = (event: MouseEvent | TouchEvent) => {
    if (!deltaRef.current) {
      return;
    }

    const isTouch = event instanceof TouchEvent;
    const clientX = isTouch ? event.touches[0].clientX : (event as MouseEvent).clientX;

    deltaRef.current.deltaX = clientX - deltaRef.current.initX;
    const dx = deltaRef.current.deltaX;

    let nextValue: number;
    if (left) {
      const nextX = Math.min(Math.max(0, scale(value[0]) + dx), scale(max));
      nextValue = scale.invert(nextX);

      onMove(nextValue < value[1] ? [nextValue, value[1]] : [value[1], nextValue]);
    } else {
      const nextX = Math.min(Math.max(0, scale(value[1]) + dx), scale(max));
      nextValue = scale.invert(nextX);

      onMove(nextValue > value[0] ? [value[0], nextValue] : [nextValue, value[0]]);
    }

    // Clear any text selection
    window.getSelection()?.removeAllRanges();
  };

  const handlePointerDown = (event: React.MouseEvent | React.TouchEvent) => {
    const isTouch = event instanceof TouchEvent;
    const clientX = isTouch ? event.touches[0].clientX : (event as React.MouseEvent).clientX;

    deltaRef.current = {
      initX: clientX,
      deltaX: 0,
    };

    // Prevent scrolling while dragging
    document.body.style.overflow = 'hidden';
    document.body.style.marginRight = '4px';

    const moveHandler = (e: MouseEvent | TouchEvent) => handleMouseMove(e);
    const upHandler = () => {
      document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', moveHandler);
      document.removeEventListener(isTouch ? 'touchend' : 'pointerup', upHandler);
      deltaRef.current = null;
      document.body.style.overflow = '';
      document.body.style.marginRight = '';
    };

    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', moveHandler);
    document.addEventListener(isTouch ? 'touchend' : 'pointerup', upHandler, { once: true });
  };

  return (
    <button
      type='button'
      aria-label={`Slider Thumb ${left ? 'Lower' : 'Upper'}`}
      className={`
        absolute top-0 flex h-[44px] w-[8px] cursor-ew-resize items-center justify-center bg-transparent
        ${left ? 'left-[-4px]' : 'right-[-4px]'}
        hover:bg-other-tonalFill10
      `}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    >
      <div className={`h-[44px] w-[1px] bg-primary-main ${left ? 'mr-[1px]' : 'ml-[1px]'}`} />
      <div
        className={`h-[20px] w-[4px] bg-primary-main absolute top-[12px] ${left ? 'left-[-4px]' : 'right-[-4px]'} rounded-sm`}
      />
      <div
        ref={textRef}
        className={cn(
          'absolute top-[12px] h-[20px] [line-height:20px_!important] bg-other-tonalFill10 rounded-sm px-2',
        )}
        style={{
          left: left ? `-${textWidth + 8}px` : undefined,
          right: left ? undefined : `-${textWidth + 8}px`,
        }}
      >
        <Text detail color='text.primary'>
          30%
        </Text>
      </div>
    </button>
  );
};

export const PriceSlider: React.FC<ControlSliderProps> = ({
  min,
  max,
  value,
  onInput,
  marketPrice,
  baseAsset,
  quoteAsset,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<ScaleLinear<number, number> | null>(null);
  const [scaleLoaded, setScaleLoaded] = useState(false);
  const [width, setWidth] = useState(0);
  const [leftValue, rightValue] = value;

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const updateWidth = () => {
      if (ref.current) {
        setWidth(ref.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (width) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- safe to use
      scaleRef.current = scaleLinear().domain([min, max]).range([0, width]);

      setScaleLoaded(true);
    }
  }, [min, max, width]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- safe to use
  const scale = scaleRef.current;

  return (
    <div>
      <div className='flex w-full justify-center gap-1 mb-4'>
        <Text detail color='text.secondary'>
          Market Price
        </Text>
        <Text detail color='text.primary'>
          {marketPrice}
        </Text>
        <Text detail color='text.secondary'>
          {baseAsset?.symbol} per {quoteAsset?.symbol}
        </Text>
      </div>
      <div ref={ref} className='relative z-0 h-[44px] w-full border-b border-other-tonalFill10'>
        <div className='absolute z-10 top-0 left-1/2 h-[44px] w-[1px] border-dashed border-neutral-contrast' />
        {scaleLoaded && scale && (
          <div
            className='absolute z-0 top-0 h-[44px] bg-primary-main/10'
            style={{
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call -- safe
              left: Math.max(0, scale(leftValue)),
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- safe
              right: Math.min(width, width - scale(rightValue)),
            }}
          >
            <Thumb left value={value} scale={scale} max={max} onMove={onInput} />
            <Thumb right value={value} scale={scale} max={max} onMove={onInput} />
          </div>
        )}
      </div>
      <div className='flex w-full justify-between gap-1'>
        <Text detail color='text.secondary'>
          {round({ value: leftValue, decimals: quoteAsset?.decimals ?? 6 })}
        </Text>
        <Text detail color='text.secondary'>
          {round({ value: rightValue, decimals: quoteAsset?.decimals ?? 6 })}
        </Text>
      </div>
    </div>
  );
};
