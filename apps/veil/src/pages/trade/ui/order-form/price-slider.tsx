import React, { useEffect, useRef, useState } from 'react';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { Text } from '@penumbra-zone/ui/Text';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { Density } from '@penumbra-zone/ui/Density';
import { round } from '@penumbra-zone/types/round';
import { useWidth } from '@/shared/utils/use-width';
import { AssetInfo } from '../../model/AssetInfo';
import DepthChart from './price-slider-depth-chart';

// Usually, `round` from `@penumbra-zone/types/round` is sufficient, but here we need number to be returned, not formatted string.
export const roundToDecimals = (num: number, decimals: number) => {
  const decimalLength = num.toString().split('.')[1]?.length ?? 0;
  if (decimalLength <= decimals) {
    return num;
  }

  const pow = Math.pow(10, decimals);
  return Math.round(num * pow) / pow;
};

// Type guard to ensure both values are defined
const areValuesDefined = (
  values: [number | undefined, number | undefined],
): values is [number, number] => {
  return values[0] !== undefined && values[1] !== undefined;
};

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
  x: number | undefined;
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

  const value = values[i] ?? 0;
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
      <div className='absolute top-[20px] left-0 z-0 h-[58px] w-px bg-primary-main' />
      <button
        type='button'
        aria-label='Slider Thumb'
        className={`absolute top-[32px] left-[-6px] h-[20px] w-[12px] cursor-ew-resize rounded-xs bg-primary-main`}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <div className='absolute top-[4px] left-[4px] h-[12px] w-px bg-neutral-contrast' />
        <div className='absolute top-[4px] right-[4px] h-[12px] w-px bg-neutral-contrast' />
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
  textsXPosRef,
}: {
  x: number | undefined;
  i: number;
  value: number;
  maxWidth: number;
  elevate: boolean;
  textsXPosRef: [[number, number], [number, number]];
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const textWidth = useWidth(textRef, [value]);

  if (x === undefined) {
    return null;
  }

  textsXPosRef[i] = [x - textWidth / 2, x + textWidth / 2];

  let left = Math.min(maxWidth - textWidth, Math.max(0, x - textWidth / 2));

  if (i === 0 && textsXPosRef[0][1] > textsXPosRef[1][0]) {
    const overlapPx = textsXPosRef[0][1] - textsXPosRef[1][0];
    left = left - overlapPx / 2;
  } else if (i === 1 && textsXPosRef[1][0] < textsXPosRef[0][1]) {
    const overlapPx = textsXPosRef[0][1] - textsXPosRef[1][0];
    left = left + overlapPx / 2;
  }

  return (
    <div
      ref={textRef}
      className={`
        absolute top-0 h-[20px] rounded-sm bg-[#2A2725] px-1 font-default
        text-text-xs font-normal text-text-primary [line-height:20px_!important]
        ${elevate ? 'z-20' : 'z-10'}
      `}
      style={{ left }}
    >
      {round({ value, decimals: 1 })}%
    </div>
  );
};

const ValueInput = ({
  x,
  i,
  value,
  maxWidth,
  elevate,
  textsXPosRef,
  exponent,
}: {
  x: number | undefined;
  i: number;
  value: number;
  maxWidth: number;
  elevate: boolean;
  textsXPosRef: [[number, number], [number, number]];
  exponent: number | undefined;
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const textWidth = useWidth(textRef, [value]);

  if (x === undefined) {
    return null;
  }

  textsXPosRef[i] = [x - textWidth / 2, x + textWidth / 2];

  let left = Math.min(maxWidth - textWidth, Math.max(0, x - textWidth / 2));

  if (i === 0 && textsXPosRef[0][1] > textsXPosRef[1][0]) {
    const overlapPx = textsXPosRef[0][1] - textsXPosRef[1][0];
    left = left - overlapPx / 2;
  } else if (i === 1 && textsXPosRef[1][0] < textsXPosRef[0][1]) {
    const overlapPx = textsXPosRef[0][1] - textsXPosRef[1][0];
    left = left + overlapPx / 2;
  }

  return (
    <div
      ref={textRef}
      className={`
        absolute top-[78px] h-[20px] rounded-sm bg-black px-1 font-default
        text-text-xs font-normal text-text-primary [line-height:20px_!important]
        ${elevate ? 'z-20' : 'z-10'}
      `}
      style={{ left }}
    >
      {round({ value, decimals: exponent ?? 6, exponentialNotation: false })}
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
  quoteExponent,
}: {
  min: number;
  max: number;
  values: [number | undefined, number | undefined];
  onInput: (value: [number, number]) => void;
  marketPrice: number | null;
  baseAsset: AssetInfo | undefined;
  quoteAsset: AssetInfo | undefined;
  quoteExponent: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const textsXPosRef = useRef<{
    input: [[number, number], [number, number]];
    percentage: [[number, number], [number, number]];
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
  const [scaleLoaded, setScaleLoaded] = useState(0);
  const [elevateThumb, setElevateThumb] = useState<number | null>(null);

  // necessary data structure to allow entering string values into inputs before parsing them as numbers.
  // after blurring the inputs, `values` start controlling them instead of `inputValues`
  const [inputValues, setInputValues] = useState<[string, string]>();

  const changeValues = (value1: number, value2: number) => {
    onInput([roundToDecimals(value1, quoteExponent), roundToDecimals(value2, quoteExponent)]);
  };

  const setInputValue = (index: number, value: string) => {
    const value1 = index === 0 ? value : (values[0]?.toString() ?? '');
    const value2 = index === 1 ? value : (values[1]?.toString() ?? '');
    changeValues(Number(value1), Number(value2));
    setInputValues([value1, value2]);
  };

  const clearInputValues = () => {
    setInputValues(undefined);
    if (!values[0] || !values[1]) {
      return;
    }

    if (values[0] > values[1]) {
      changeValues(values[1], values[1]);
    } else if (values[1] < values[0]) {
      changeValues(values[0], values[1]);
    }
  };

  useEffect(() => {
    if (width) {
      scaleRef.current = scaleLinear().domain([min, max]).range([0, width]);

      // update scaleLoaded to trigger re-render
      setScaleLoaded(prev => prev + 1);
    }
  }, [min, max, width, values]);

  const scale = scaleRef.current;
  const leftX = scaleLoaded && scale && values[0] ? Math.max(0, scale(values[0])) : undefined;
  const leftX1 = scaleLoaded && scale && values[1] ? Math.max(0, scale(values[1])) : undefined;
  const rightX =
    scaleLoaded && scale && values[1] ? Math.min(width, width - scale(values[1])) : undefined;

  return (
    <div>
      <div className='flex w-full justify-center gap-1'>
        <Text detail color='text.secondary'>
          1 {baseAsset?.symbol} =
        </Text>
        <Text detail color='text.primary'>
          {marketPrice} {quoteAsset?.symbol}
        </Text>
      </div>
      <div ref={ref} className='relative z-0 h-[98px] w-full'>
        {/* midprice line */}
        <div className='absolute top-0 left-1/2 z-30 h-[70px] w-0 border-l border-dashed border-neutral-contrast' />
        {!!scaleLoaded && scale && (
          <>
            <DepthChart scale={scale} width={width} height={62} />
            {/* slider bg gradient */}
            <div
              className='absolute top-0 z-10 h-[70px] bg-linear-to-b from-[rgba(186,77,20,0)] from-10% to-[rgba(186,77,20,0.35)]'
              style={{
                left: leftX,
                right: rightX,
              }}
            />
            {/* left & right handles */}
            {areValuesDefined(values) &&
              values.map((value, i) => {
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
                      elevate={elevate}
                      onPointerDown={() => setElevateThumb(i)}
                      onMove={nextValue =>
                        i === 0
                          ? changeValues(nextValue, values[1])
                          : changeValues(values[0], nextValue)
                      }
                    />
                    <PercentageInput
                      x={x}
                      i={i}
                      textsXPosRef={textsXPosRef.current.percentage}
                      maxWidth={width}
                      value={marketPrice ? ((value - marketPrice) / marketPrice) * 100 : 0}
                      elevate={elevate}
                    />
                    <ValueInput
                      x={x}
                      i={i}
                      textsXPosRef={textsXPosRef.current.input}
                      maxWidth={width}
                      value={value}
                      elevate={elevate}
                      exponent={quoteExponent}
                    />
                  </React.Fragment>
                );
              })}
          </>
        )}

        {/* slider track bg */}
        <div className='absolute top-[62px] left-0 z-10 h-[6px] w-full rounded-xs bg-other-tonal-fill10' />
        {/* filled slider track */}
        {!!scaleLoaded && scale && (
          <div
            className='absolute top-[62px] z-20 h-[6px] bg-primary-main'
            style={{
              left: leftX,
              right: rightX,
            }}
          />
        )}
      </div>

      <div className='mt-1 flex items-center justify-between gap-2'>
        <Density compact>
          <TextInput
            type='number'
            blurOnWheel
            maxDecimals={quoteExponent}
            onBlur={clearInputValues}
            value={inputValues?.[0] ?? values[0]?.toString() ?? ''}
            onChange={value => setInputValue(0, value)}
          />
          <Text detail color='text.secondary'>
            —
          </Text>
          <TextInput
            type='number'
            blurOnWheel
            maxDecimals={quoteExponent}
            onBlur={clearInputValues}
            value={inputValues?.[1] ?? values[1]?.toString() ?? ''}
            onChange={value => setInputValue(1, value)}
          />
        </Density>
      </div>
    </div>
  );
};
