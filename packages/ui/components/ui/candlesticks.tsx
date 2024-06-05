import { BoxPlot } from '@visx/stats';
import { CandlestickData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { scaleLinear } from '@visx/scale';
import { useEffect, useMemo, useState } from 'react';
import { Threshold } from '@visx/threshold';
import { curveLinear } from '@visx/curve';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { LinePath } from '@visx/shape';
import { withParentSize, useParentSize } from '@visx/responsive';
import { withTooltip, Tooltip } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

// accessors
const blockHeight = (d: CandlestickData) => Number(d.height);
const lowPrice = (d: CandlestickData) => d.low;
const highPrice = (d: CandlestickData) => d.high;
const openPrice = (d: CandlestickData) => d.open;
const closePrice = (d: CandlestickData) => d.close;
const midPrice = (d: CandlestickData) => (openPrice(d) + closePrice(d)) / 2;
const priceMovement = (d: CandlestickData) => closePrice(d) - openPrice(d);
//const priceSpread = (d: CandlestickData) => highPrice(d) - lowPrice(d);
const priceMovementColor = (d: CandlestickData) => {
  const movement = priceMovement(d);
  if (movement > 0) return 'green';
  else if (movement < 0) return 'red';
  else return 'white';
};

interface CandlestickPlotProps {
  parentWidth?: number;
  parentHeight?: number;
  width?: number;
  height?: number;
  candles: CandlestickData[];
  getBlockDate: (h: bigint, s?: AbortSignal) => Promise<Date | undefined>;
  latestKnownBlockHeight?: number;
  beginMetadata?: Metadata;
  endMetadata?: Metadata;
}

export const Candlesticks = withTooltip<CandlestickPlotProps, CandlestickData>(
  ({
    // plot props
    candles,
    beginMetadata,
    endMetadata,
    getBlockDate,
    latestKnownBlockHeight,

    // tooltip props
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    showTooltip,
    hideTooltip,
  }: CandlestickPlotProps & WithTooltipProvidedProps<CandlestickData>) => {
    const { parentRef, width: w, height: h } = useParentSize({ debounceTime: 150 });

    const [tooltipDataHeight, setTooltipDataHeight] = useState<bigint>();
    const [tooltipDataDate, setTooltipDataDate] = useState<Date>();

    const { maxPrice, minPrice } = useMemo(
      () =>
        candles.reduce(
          (acc, d) => ({
            minPrice: Math.min(acc.minPrice, lowPrice(d)),
            maxPrice: Math.max(acc.maxPrice, highPrice(d)),
          }),
          { minPrice: Infinity, maxPrice: -Infinity },
        ),
      [candles],
    );

    const between = maxPrice - minPrice;

    useEffect(() => {
      if (!tooltipDataHeight) {
        setTooltipDataDate(undefined);
        return;
      } else {
        const ac = new AbortController();
        void getBlockDate(tooltipDataHeight, ac.signal).then(setTooltipDataDate);
        return () => ac.abort('useEffect cleanup');
      }
    }, [tooltipDataHeight]);

    if (!candles.length || !endMetadata || !beginMetadata) return null;

    // assertions here okay because we've just checked length
    const startBlock = blockHeight(candles[0]!);
    const endBlock = blockHeight(candles[candles.length - 1]!);

    // candles fitting graph witdth. likely too thin to really matter
    //const blockWidth = w / (endBlock - startBlock);
    const blockWidth = Math.min(w / candles.length, 8);

    const blockScale = scaleLinear<number>({
      range: [50, w - 5],
      domain: [startBlock, latestKnownBlockHeight ?? endBlock],
    });

    const priceScale = scaleLinear<number>({
      range: [h, 0],
      //range: [0, h],
      domain: [minPrice - between / 2, maxPrice + between / 2],
    });

    return (
      <>
        <div className='size-full select-none' ref={parentRef}>
          <svg width={w} height={h}>
            <Group>
              <AxisBottom
                tickLabelProps={{
                  fill: 'white',
                  textAnchor: 'middle',
                }}
                tickStroke='rgba(255,255,255,0.25)'
                top={h - 50}
                scale={blockScale}
                numTicks={4}
                rangePadding={10}
              />
              <GridRows // price axis grid
                scale={priceScale}
                width={w}
                stroke='rgba(255,255,255,0.1)'
                numTicks={3}
              />
              <AxisLeft // price axis
                tickFormat={value => Number(value).toFixed(2)}
                tickLabelProps={{
                  fill: 'white',
                  textAnchor: 'end',
                }}
                left={50}
                scale={priceScale}
                numTicks={3}
              />
              {
                <Threshold
                  id='price-spread'
                  curve={curveLinear}
                  data={candles}
                  x={(d: CandlestickData) => blockScale(blockHeight(d))}
                  y0={(d: CandlestickData) => priceScale(lowPrice(d))}
                  y1={(d: CandlestickData) => priceScale(highPrice(d))}
                  clipAboveTo={0}
                  clipBelowTo={h}
                  belowAreaProps={{
                    // spread shading
                    fill: 'black',
                    fillOpacity: 0.1,
                  }}
                  aboveAreaProps={{
                    // should not happen shading
                    fill: 'magenta',
                    fillOpacity: 0.2,
                  }}
                />
              }
              <LinePath
                id='median-price'
                curve={curveLinear}
                data={candles}
                x={(d: CandlestickData) => blockScale(blockHeight(d))}
                y={(d: CandlestickData) => priceScale((openPrice(d) + closePrice(d)) * 0.5)}
                stroke='white'
                strokeOpacity={0.2}
                strokeWidth={2}
              />
              {candles.map((d: CandlestickData, i) => {
                const movementColor = priceMovementColor(d);

                const gray = 'rgba(255,255,255,0.5)';

                const open = openPrice(d);
                const close = closePrice(d);
                const low = lowPrice(d);
                const high = highPrice(d);
                const median = midPrice(d);

                const boxLeft = blockScale(blockHeight(d)) - blockWidth / 2;

                const toolTip = {
                  onMouseOver: () => {
                    setTooltipDataHeight(d.height);
                    showTooltip({
                      tooltipTop: priceScale(median),
                      tooltipLeft: blockScale(blockHeight(d)),
                      tooltipData: d,
                    });
                  },
                  onMouseLeave: () => {
                    setTooltipDataHeight(undefined);
                    hideTooltip();
                  },
                };

                return (
                  <g key={i}>
                    <BoxPlot
                      boxProps={{
                        ...toolTip,
                        strokeWidth: 0,
                        stroke: movementColor,
                        rx: 0,
                        ry: 0,
                      }}
                      min={low}
                      max={high}
                      left={boxLeft}
                      median={median}
                      containerProps={{
                        ...toolTip,
                      }}
                      medianProps={{
                        ...toolTip,
                        stroke: 'transparent',
                        //strokeWidth: 5,
                        //stroke: 'transparent',
                      }}
                      firstQuartile={Math.min(open, close)}
                      thirdQuartile={Math.max(open, close)}
                      fill={movementColor}
                      boxWidth={blockWidth}
                      stroke={gray}
                      strokeWidth={blockWidth / 2}
                      minProps={{
                        ...toolTip,
                      }}
                      maxProps={{
                        ...toolTip,
                      }}
                      valueScale={priceScale}
                    />
                  </g>
                );
              })}
            </Group>
          </svg>
        </div>
        {tooltipOpen && tooltipData && (
          <CandlesticksTooltip
            top={tooltipTop}
            left={tooltipLeft}
            data={tooltipData}
            endMetadata={endMetadata}
            beginMetadata={beginMetadata}
            dataDate={tooltipDataDate}
          />
        )}
      </>
    );
  },
);

export const CandlesticksWithParentSize = withParentSize(Candlesticks);

export const CandlesticksTooltip = ({
  top,
  left,
  data, //getBlockDate,
  endMetadata,
  beginMetadata,
  dataDate,
}: {
  top?: number;
  left?: number;
  data: CandlestickData;
  endMetadata: Metadata;
  beginMetadata: Metadata;
  //getBlockDate: (h: bigint, s?: AbortSignal) => Promise<Date | undefined>;
  dataDate?: Date;
}) => {
  const endBase = endMetadata.denomUnits.filter(d => !d.exponent)[0]!;
  const beginBase = beginMetadata.denomUnits.filter(d => !d.exponent)[0]!;
  //const endDisplay = endMetadata.denomUnits.filter(d => d.denom === endMetadata.display)[0]!;
  //const beginDisplay = beginMetadata.denomUnits.filter(d => d.denom === beginMetadata.display)[0]!;
  return (
    <Tooltip
      {...{ top, left }}
      style={{}} // unset styles
      className='absolute m-2 border border-solid border-light-brown bg-secondary p-2 font-mono text-xs opacity-80'
    >
      <div className='flex flex-row justify-between'>
        <div>
          <div>
            block {String(data.height)} ({dataDate?.toLocaleString()})
          </div>
          <div>
            Price of {endBase.denom} in {beginBase.denom}
          </div>
        </div>
        {
          // if difference is more significant than 0.0001, show arrow
          Boolean(priceMovement(data) * 1000) && (
            <div>
              {priceMovement(data) > 0 ? (
                <ArrowUpRight className='text-green-500' size={32} />
              ) : (
                <ArrowDownRight className='text-red-500' size={32} />
              )}
            </div>
          )
        }
      </div>
      <div className='grid grid-flow-col grid-rows-2 gap-x-2 text-right'>
        <div>
          high: {Number(data.high).toFixed(4)} {beginBase.denom}
        </div>
        <div>
          low: {Number(data.low).toFixed(4)} {beginBase.denom}
        </div>
        <div>
          open: {Number(data.open).toFixed(4)} {beginBase.denom}
        </div>
        <div>
          close: {Number(data.close).toFixed(4)} {beginBase.denom}
        </div>
      </div>
      <div>{Number(data.directVolume)} direct trades</div>
      <div>{Number(data.swapVolume)} indirect trades</div>
    </Tooltip>
  );
};
