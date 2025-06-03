import React, { useEffect, useRef, useState } from 'react';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { Text } from '@penumbra-zone/ui';
import { round } from '@penumbra-zone/types/round';
import { useWidth } from '@/shared/utils/use-width';
import { AssetInfo } from '../../model/AssetInfo';

const Thumb = ({
  x,
  i,
  values,
  scale,
  max,
  onMove,
  elevate,
  onPointerDown,
}: {
  x: number;
  i: number;
  values: [number, number];
  scale: ScaleLinear<number, number>;
  max: number;
  onMove: (value: number) => void;
  elevate: boolean;
  onPointerDown: () => void;
}) => {
  const deltaRef = useRef<{
    initX: number;
    deltaX: number;
  } | null>(null);

  const value = values[i];
  const otherValue = values[i === 0 ? 1 : 0];

  const moveHandler = (event: MouseEvent | TouchEvent) => {
    if (!deltaRef.current) {
      return;
    }

    const isTouch = event instanceof TouchEvent;
    const clientX = isTouch ? (event.touches[0]?.clientX ?? 0) : event.clientX;

    deltaRef.current.deltaX = clientX - deltaRef.current.initX;
    const dx = deltaRef.current.deltaX;

    const minX = i === 0 ? 0 : scale(otherValue);
    const maxX = i === 1 ? scale(max) : scale(otherValue);
    const nextX = Math.min(Math.max(minX, scale(value) + dx), maxX);
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

    const upHandler = () => {
      document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', moveHandler);
      deltaRef.current = null;
      document.body.style.overflow = '';
      document.body.style.marginRight = '';
    };

    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', moveHandler);
    document.addEventListener(isTouch ? 'touchend' : 'pointerup', upHandler, { once: true });
  };

  return (
    <div
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
        aria-label='Slider Thumb'
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

const PercentageInput = ({
  x,
  i,
  value,
  maxWidth,
  elevate,
  textsRef,
}: {
  x: number;
  i: number;
  value: number;
  maxWidth: number;
  elevate: boolean;
  textsRef: [number, number][];
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const textWidth = useWidth(textRef, [value]);
  textsRef[i] = [x - textWidth / 2, x + textWidth / 2];

  let left = Math.min(maxWidth - textWidth, Math.max(0, x - textWidth / 2));

  if (i === 0 && textsRef[0][1] > textsRef[1][0]) {
    const overlapPx = textsRef[0][1] - textsRef[1][0];
    left = left - overlapPx / 2;
  } else if (i === 1 && textsRef[1][0] < textsRef[0][1]) {
    const overlapPx = textsRef[0][1] - textsRef[1][0];
    left = left + overlapPx / 2;
  }

  return (
    <div
      ref={textRef}
      className={`
        absolute top-0 h-[20px] [line-height:20px_!important] bg-[#2A2725] rounded-sm px-1
        font-default text-textXs font-normal text-text-primary
        ${elevate ? 'z-20' : 'z-10'}
      `}
      style={{ left }}
    >
      {round({ value, decimals: 1 })}%{/* </Text> */}
    </div>
  );
};

const ValueInput = ({
  x,
  i,
  value,
  maxWidth,
  elevate,
  textsRef,
}: {
  x: number;
  i: number;
  value: number;
  maxWidth: number;
  elevate: boolean;
  textsRef: [number, number][];
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const textWidth = useWidth(textRef, [value]);
  textsRef[i] = [x - textWidth / 2, x + textWidth / 2];

  let left = Math.min(maxWidth - textWidth, Math.max(0, x - textWidth / 2));

  if (i === 0 && textsRef[0][1] > textsRef[1][0]) {
    const overlapPx = textsRef[0][1] - textsRef[1][0];
    left = left - overlapPx / 2;
  } else if (i === 1 && textsRef[1][0] < textsRef[0][1]) {
    const overlapPx = textsRef[0][1] - textsRef[1][0];
    left = left + overlapPx / 2;
  }

  return (
    <div
      ref={textRef}
      className={`
        absolute top-[78px] h-[20px] [line-height:20px_!important] bg-black rounded-sm px-1
        font-default text-textXs font-normal text-text-primary
        ${elevate ? 'z-20' : 'z-10'}
      `}
      style={{ left }}
    >
      {round({ value, decimals: 6 })}
    </div>
  );
};

export const PriceSlider = ({
  min,
  max,
  values,
  onInput,
  marketPrice,
  baseAsset,
  quoteAsset,
}: {
  min: number;
  max: number;
  values: [number, number];
  onInput: (value: [number, number]) => void;
  marketPrice: number;
  baseAsset: AssetInfo | undefined;
  quoteAsset: AssetInfo | undefined;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const textsRef = useRef<{
    input: [number, number][];
    percentage: [number, number][];
  }>({
    input: [
      [0, 0],
      [Infinity, Infinity],
    ],
    percentage: [
      [0, 0],
      [Infinity, Infinity],
    ],
  });
  const width = useWidth(ref, []);
  const scaleRef = useRef<ScaleLinear<number, number> | null>(null);
  const [scaleLoaded, setScaleLoaded] = useState(false);
  const [elevateThumb, setElevateThumb] = useState<number | null>(null);

  useEffect(() => {
    if (width) {
      scaleRef.current = scaleLinear().domain([min, max]).range([0, width]);
      setScaleLoaded(true);
    }
  }, [min, max, width]);

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
        {scaleLoaded && scale && (
          <>
            {/* slider bg gradient */}
            <div
              className='absolute z-10 top-0 h-[70px] bg-gradient-to-b from-[rgba(186,77,20,0)] from-10% to-[rgba(186,77,20,0.35)]'
              style={{
                left: leftX,
                right: rightX,
              }}
            />
            {/* left & right handles */}
            {values.map((value, i) => {
              const elevate = elevateThumb === i;
              const x = i === 0 ? leftX : leftX1;

              return (
                <React.Fragment key={i}>
                  <Thumb
                    x={x}
                    i={i}
                    values={values}
                    scale={scale}
                    max={max}
                    maxWidth={width}
                    onMove={nextValue =>
                      onInput(i === 0 ? [nextValue, values[1]] : [values[0], nextValue])
                    }
                    elevate={elevate}
                    onPointerDown={() => setElevateThumb(i)}
                  />
                  <PercentageInput
                    x={x}
                    i={i}
                    textsRef={textsRef.current.percentage}
                    maxWidth={width}
                    value={((value - marketPrice) / marketPrice) * 100}
                    elevate={elevate}
                  />
                  <ValueInput
                    x={x}
                    i={i}
                    textsRef={textsRef.current.input}
                    maxWidth={width}
                    value={value}
                    elevate={elevate}
                  />
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
