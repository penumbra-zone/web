import React, { useEffect, useRef, useState } from 'react';
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

const Thumb: React.FC<ThumbProps> = ({ x, value, scale, max, onMove, elevate, onPointerDown }) => {
  const deltaRef = useRef<DeltaState | null>(null);

  const handleMouseMove = (event: MouseEvent | TouchEvent) => {
    if (!deltaRef.current) {
      return;
    }

    const isTouch = event instanceof TouchEvent;
    const clientX = isTouch ? event.touches[0].clientX : (event as MouseEvent).clientX;

    deltaRef.current.deltaX = clientX - deltaRef.current.initX;
    const dx = deltaRef.current.deltaX;

    const nextX = Math.min(Math.max(0, scale(value) + dx), scale(max));
    onMove(scale.invert(nextX));

    // Clear any text selection
    window.getSelection()?.removeAllRanges();
  };

  const handlePointerDown = (event: React.MouseEvent | React.TouchEvent) => {
    const isTouch = event instanceof TouchEvent;
    const clientX = isTouch
      ? (event.touches[0]?.clientX ?? 0)
      : (event as React.MouseEvent).clientX;

    deltaRef.current = {
      initX: clientX,
      deltaX: 0,
    };

    // Prevent scrolling while dragging
    document.body.style.overflow = 'hidden';
    document.body.style.marginRight = '4px';
    onPointerDown();

    const moveHandler = (e: MouseEvent | TouchEvent) => handleMouseMove(e);
    const upHandler = () => {
      document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', moveHandler);
      document.removeEventListener(isTouch ? 'touchend' : 'pointerup', upHandler);
      deltaRef.current = null;
      document.body.style.overflow = '';
      document.body.style.marginRight = '';

      // onPointerUp();
    };

    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', moveHandler);
    document.addEventListener(isTouch ? 'touchend' : 'pointerup', upHandler, { once: true });
  };

  return (
    <div
      // ${left ? 'left-0' : 'right-0'}
      className={`
        absolute top-0 flex h-[78px] w-[8px] items-center justify-center bg-transparent
        ${elevate ? 'z-20' : 'z-10'}
      `}
      style={{
        left: x,
      }}
    >
      <div
        // className={`absolute z-0 w-[1px] top-[20px] h-[58px] bg-primary-main ${left ? 'left-0' : 'right-0'}`}
        className={`absolute z-0 w-[1px] top-[20px] h-[58px] bg-primary-main left-0`}
      />
      <button
        type='button'
        // aria-label={`Slider Thumb ${left ? 'Lower' : 'Upper'}`}
        aria-label='Slider Thumb'
        // className={`w-[12px] h-[20px] bg-primary-main absolute top-[32px] cursor-ew-resize rounded-[4px] ${left ? 'left-[-6px]' : 'right-[-6px]'} `}
        className={`w-[12px] h-[20px] bg-primary-main absolute top-[32px] cursor-ew-resize rounded-[4px] left-[-6px]`}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <div className='absolute top-[4px] left-[4px] w-[1px] h-[12px] bg-neutral-contrast' />
        <div className='absolute top-[4px] right-[4px] w-[1px] h-[12px] bg-neutral-contrast' />
      </button>
    </div>
  );
};

const PercentageInput = ({ x, value, maxWidth, elevate }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => {
      // useComponentSize doesnt set width correctly on updates
      setTextWidth(textRef.current?.offsetWidth ?? 0);
    });
  }, [value]);

  return (
    <div
      ref={textRef}
      className={`
        absolute top-0 h-[20px] [line-height:20px_!important] bg-[#2A2725] rounded-sm px-2
        ${elevate ? 'z-20' : 'z-10'}
      `}
      style={{
        left: Math.min(maxWidth - textWidth, Math.max(0, x - textWidth / 2)),
      }}
    >
      <Text detail color='text.primary'>
        30%
      </Text>
    </div>
  );
};

const ValueInput = ({ x, value, maxWidth, elevate }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => {
      // useComponentSize doesnt set width correctly on updates
      setTextWidth(textRef.current?.offsetWidth ?? 0);
    });
  }, [value]);

  return (
    <div
      ref={textRef}
      className={`
        absolute top-[78px] h-[20px] [line-height:20px_!important] bg-black rounded-sm px-2
        ${elevate ? 'z-20' : 'z-10'}
      `}
      style={{
        left: Math.min(maxWidth - textWidth, Math.max(0, x - textWidth / 2)),
      }}
    >
      <Text detail color='text.primary'>
        {round({ value, decimals: 6 })}
      </Text>
    </div>
  );
};

export const PriceSlider: React.FC<ControlSliderProps> = ({
  min,
  max,
  values,
  onInput,
  marketPrice,
  baseAsset,
  quoteAsset,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<ScaleLinear<number, number> | null>(null);
  const [scaleLoaded, setScaleLoaded] = useState(false);
  const [width, setWidth] = useState(0);
  const [elevateThumb, setElevateThumb] = useState(null);

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
  const leftX = scaleLoaded && scale ? Math.max(0, scale(values[0])) : undefined;
  const leftX1 = scaleLoaded && scale ? Math.max(0, scale(values[1])) : undefined;
  const rightX = scaleLoaded && scale ? Math.min(width, width - scale(values[1])) : undefined;

  return (
    <div>
      <div className='flex w-full justify-center gap-1 mb-4'>
        <Text detail color='text.secondary'>
          1 {quoteAsset?.symbol} =
        </Text>
        <Text detail color='text.primary'>
          {marketPrice} {baseAsset?.symbol}
        </Text>
      </div>
      <div ref={ref} className='relative z-0 h-[98px] w-full border-b border-other-tonalFill10'>
        {/* midprice line */}
        <div className='absolute z-30 top-0 left-1/2 h-[70px] w-0 border-l border-dashed border-neutral-contrast' />
        {/* slider bg gradient */}
        {scaleLoaded && scale && (
          <>
            <div
              className='absolute z-0 top-0 h-[70px] bg-gradient-to-b from-[rgba(186,77,20,0)] to-primary-main/10'
              style={{
                left: leftX,
                right: rightX,
              }}
            />
            {values.map((value, i) => {
              const elevate = i === 0 ? elevateThumb === 0 : elevateThumb === 1;
              const x = i === 0 ? leftX : leftX1;

              return (
                <React.Fragment key={i}>
                  <Thumb
                    x={x}
                    value={value}
                    scale={scale}
                    max={max}
                    maxWidth={width}
                    onMove={nextValue =>
                      onInput(i === 0 ? [nextValue, values[1]] : [values[0], nextValue])
                    }
                    elevate={elevate}
                    onPointerDown={() => setElevateThumb(i)}
                  />
                  <PercentageInput x={x} maxWidth={width} value={value} elevate={elevate} />
                  <ValueInput x={x} maxWidth={width} value={value} elevate={elevate} />
                </React.Fragment>
              );
            })}
          </>
        )}

        {/* slider track bg */}
        <div className='absolute z-10 top-[62px] left-0 w-full h-[6px] bg-other-tonalFill10 rounded-xs' />
        {/* filled slider track */}
        {scaleLoaded && scale && (
          <div
            className='absolute z-20 top-[62px] h-[6px] bg-primary-main'
            style={{
              left: leftX,
              right: rightX,
            }}
          />
        )}
      </div>
    </div>
  );
};
