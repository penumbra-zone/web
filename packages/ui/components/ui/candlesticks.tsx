//import candlestickJson from './candlestick.json';
import { BoxPlot } from '@visx/stats';
import { CandlestickData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { scaleLinear } from '@visx/scale';
import { useMemo } from 'react';
import { Threshold } from '@visx/threshold';
import { curveLinear } from '@visx/curve';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { LinePath } from '@visx/shape';
import { withParentSize } from '@visx/responsive';

// accessors
const blockHeight = (d: CandlestickData) => Number(d.height);
const lowPrice = (d: CandlestickData) => d.low;
const highPrice = (d: CandlestickData) => d.high;
const openPrice = (d: CandlestickData) => d.open;
const closePrice = (d: CandlestickData) => d.close;
const priceMovement = (d: CandlestickData) => closePrice(d) - openPrice(d);
const priceSpread = (d: CandlestickData) => highPrice(d) - lowPrice(d);
const priceMovementColor = (d: CandlestickData) => {
  if (priceMovement(d) > 0) return 'green';
  else if (priceMovement(d) < 0) return 'red';
  else return 'white';
};

const stdDev = (numArr: (number | bigint)[]) => {
  if (numArr.length === 0) return { mean: 0n, dev: 0 };
  const arr = numArr.map(x => BigInt(x));
  const n = BigInt(arr.length);
  const mean = arr.reduce((a, b) => a + b) / n;
  const avgDistSq = arr.map(x => (x - mean) ** 2n).reduce((a, b) => a + b) / n;
  const dev = Math.sqrt(Number(avgDistSq));
  console.log('stdd', { mean, dev });
  return { mean, dev };
};

export const Candlesticks = ({
  parentWidth,
  parentHeight,
  width: w = parentWidth || 1000,
  height: h = parentHeight || 1000,
  candles: candles1,
  latestKnownBlockHeight,
}: {
  parentWidth?: number;
  parentHeight?: number;
  width?: number;
  height?: number;
  candles: CandlestickData[];
  latestKnownBlockHeight?: number;
}) => {
  console.log({ parentHeight, parentWidth, w, h });
  if (!w || !h) return null;
  const dedupeCandles = (originalCandles: CandlestickData[]) => {
    const { mean: meanHeight, dev: devHeight } = stdDev(originalCandles.map(d => d.height));
    if (!meanHeight || !devHeight) return originalCandles;
    const deviation = BigInt(Math.floor(devHeight));

    const identical = (a: CandlestickData, b: CandlestickData) =>
      a.low === b.low && a.high === b.high && a.open === b.open && a.close === b.close;

    const samePrices = (a: CandlestickData) => a.open === a.close || a.low === a.high;

    const lessCandles = new Array<CandlestickData>();
    for (let i = 1; i < originalCandles.length - 1; i++) {
      const current = originalCandles[i]!;
      const before = originalCandles[i - 1]!;
      const after = originalCandles[i + 1]!;
      if (samePrices(current)) continue;
      if (current.height < meanHeight - deviation) continue;
      if (identical(current, before) && identical(current, after)) continue;
      lessCandles.push(current);
    }
    lessCandles.push(originalCandles[originalCandles.length - 1]!);

    return lessCandles;
  };

  let fuck = false;
  const candles = fuck
    ? candles1
    : useMemo(() => dedupeCandles(dedupeCandles(candles1)), [candles1]);

  console.log('dedupe', candles.length, 'original', candles1.length);
  console.log('deduped content', candles);

  const { minPrice, maxPrice, maxOC, minOC } = useMemo(() => {
    const allMin = candles.map(lowPrice);
    const allOpen = candles.map(openPrice);
    const allClose = candles.map(closePrice);
    const allMax = candles.map(highPrice);
    const allHeight = candles.map(d => d.height);

    return {
      maxOC: Math.max(Math.max(...allOpen), Math.max(...allClose)),
      minOC: Math.min(Math.min(...allOpen), Math.min(...allClose)),
      avgHeight: candles.length
        ? allHeight.reduce((a, b) => a + b, 0n) / BigInt(candles.length)
        : undefined,
      minPrice: Math.min(...allMin),
      maxPrice: Math.max(...allMax),
    };
  }, [candles]);

  if (!candles.length) return null;

  //const startBlock = blockHeight(candles[0]!);
  const startBlock = blockHeight(candles[0]!);
  const endBlock = blockHeight(candles[candles.length - 1]!);
  const blockWidth = w / (endBlock - startBlock);

  // scales
  const xScale = scaleLinear<number>({
    range: [0, w],
    domain: [startBlock, latestKnownBlockHeight ?? endBlock],
  });

  const halfwayToZero = Math.min(minPrice, minOC) / 2;
  const yScale = scaleLinear<number>({
    range: [h, 0],
    domain: [
      // order?
      Math.min(minPrice, minOC) / 2,
      Math.max(maxOC, maxPrice) + halfwayToZero,
    ],
  });

  return (
    <svg width={w} height={h}>
      <Group>
        <AxisBottom
          tickLabelProps={{
            fill: 'white',
            textAnchor: 'middle',
          }}
          stroke='white'
          tickStroke='white'
          top={h - 50}
          scale={xScale}
          numTicks={10}
        />
        <AxisLeft
          stroke='white'
          tickStroke='white'
          tickLabelProps={{
            fill: 'white',
            textAnchor: 'middle',
          }}
          left={50}
          scale={yScale}
        />
        <Threshold
          id='priceSpread'
          curve={curveLinear}
          data={candles}
          x={(d: CandlestickData) => xScale(blockHeight(d))}
          y0={(d: CandlestickData) => yScale(lowPrice(d))}
          y1={(d: CandlestickData) => yScale(highPrice(d))}
          clipAboveTo={0}
          clipBelowTo={h}
          belowAreaProps={{
            // spread shading
            fill: 'teal',
            fillOpacity: 0.2,
          }}
          //stroke='white'
          //strokeOpacity={0.2}
          //strokeWidth={2}
        />
        <LinePath
          id='medianPrice'
          curve={curveLinear}
          data={candles}
          x={(d: CandlestickData) => xScale(blockHeight(d))}
          y={(d: CandlestickData) => yScale((openPrice(d) + closePrice(d)) * 0.5)}
          stroke='white'
          strokeOpacity={0.2}
          strokeWidth={2}
        />
        {candles.map((d: CandlestickData, i) => {
          const fillColor = priceMovementColor(d);

          const gray = 'rgba(255,255,255,0.5)';

          const open = openPrice(d);
          const close = closePrice(d);
          const low = lowPrice(d);
          const high = highPrice(d);
          const median = (open + close) / 2;

          if (priceSpread(d) || priceMovement(d))
            console.log(d.height, priceSpread(d), priceMovement(d), {
              min: lowPrice(d),
              max: highPrice(d),
              open: open,
              close: close,
              fillColor,
            });

          const boxWidth = Math.max(blockWidth, 5);
          const left = xScale(blockHeight(d)) - boxWidth / 2;

          return (
            <g key={i}>
              <BoxPlot
                boxProps={{
                  strokeWidth: 0,
                  stroke: fillColor,
                  rx: 0,
                  ry: 0,
                }}
                min={low}
                max={high}
                left={left}
                median={median}
                medianProps={{
                  display: 'none',
                  //stroke: fillColor,
                  //strokeWidth: 5,
                  //stroke: 'transparent',
                }}
                firstQuartile={Math.max(open, close)}
                thirdQuartile={Math.min(open, close)}
                fill={fillColor}
                fillOpacity={1}
                boxWidth={boxWidth}
                stroke={gray}
                strokeWidth={2.5}
                minProps={{
                  stroke: priceSpread(d) ? 'magenta' : 'none',
                }}
                maxProps={{
                  stroke: priceSpread(d) ? 'cyan' : 'none',
                }}
                valueScale={yScale}
              />
            </g>
          );
        })}
      </Group>
    </svg>
  );
};

export const CandlesticksWithParentSize = withParentSize(Candlesticks);
