import React, { useEffect, useRef, useState } from 'react';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { Text } from '@penumbra-zone/ui';

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

  const handleMouseMove = (event: MouseEvent | TouchEvent) => {
    if (!deltaRef.current) {
      return;
    }

    const isTouch = event instanceof TouchEvent;
    const clientX = isTouch ? event.touches[0].clientX : (event as MouseEvent).clientX;

    deltaRef.current.deltaX = clientX - deltaRef.current.initX;
    const dx = deltaRef.current.deltaX;

    if (left) {
      const nextX = Math.min(Math.max(0, scale(value[0]) + dx), scale(max));
      const nextValue = scale.invert(nextX);

      onMove(nextValue < value[1] ? [nextValue, value[1]] : [value[1], nextValue]);
    } else {
      const nextX = Math.min(Math.max(0, scale(value[1]) + dx), scale(max));
      const nextValue = scale.invert(nextX);

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

    const moveHandler = (e: MouseEvent | TouchEvent) => handleMouseMove(e);
    const upHandler = () => {
      document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', moveHandler);
      document.removeEventListener(isTouch ? 'touchend' : 'pointerup', upHandler);
      deltaRef.current = null;
      document.body.style.overflow = '';
    };

    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', moveHandler);
    document.addEventListener(isTouch ? 'touchend' : 'pointerup', upHandler, { once: true });
  };

  return (
    <button
      type='button'
      aria-label={`Slider Thumb ${left ? 'Lower' : 'Upper'}`}
      className={`
        absolute top-[-32px] flex h-[40px] w-[8px] cursor-ew-resize items-center justify-center bg-transparent
        ${left ? 'left-[-4px]' : 'right-[-4px]'}
        hover:bg-other-tonalFill10
      `}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    >
      <div className='h-[40px] w-[1px] bg-neutral-light mr-[1px]' />
      {/* <div className='h-3 w-[1.5px] bg-neutral-500' /> */}
    </button>
  );
};

export const ControlSlider: React.FC<ControlSliderProps> = ({ min, max, value, onInput }) => {
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
    <div className='px-1'>
      <div className='h-[32px]'></div>
      <div ref={ref} className='relative h-[32px] w-full'>
        <div className='h-[8px] w-full rounded-md bg-other-tonalFill10'>
          {scaleLoaded && scale && (
            <div
              className='absolute h-[8px] bg-primary-main'
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
        <div className='absolute z-10 left-1/2 h-[16px] w-[1px] bg-neutral-light' />
        <div className='absolute z-10 left-1/2 top-[16px] transform -translate-x-1/2 flex items-center gap-1 p-1 bg-other-tonalFill10 rounded-sm'>
          <Text detail color='text.secondary'>
            Current Price:
          </Text>
          <Text detail color='text.primary'>
            0.50
          </Text>
        </div>
      </div>
    </div>
  );
};
