import { theme } from '@penumbra-zone/ui/theme';
import { adaptData, PreviewChartAdapterOptions } from './adapter';
import { useId } from 'react';

export interface PreviewChartProps extends PreviewChartAdapterOptions {
  sign: 'positive' | 'negative' | 'neutral';
}

const getGradientColor = (sign: PreviewChartProps['sign']) => {
  if (sign === 'positive') {
    return theme.color.success.main;
  }
  if (sign === 'negative') {
    return theme.color.destructive.main;
  }
  return theme.color.neutral.main;
};

const getColor = (sign: PreviewChartProps['sign']) => {
  if (sign === 'positive') {
    return theme.color.success.light;
  }
  if (sign === 'negative') {
    return theme.color.destructive.light;
  }
  return theme.color.neutral.light;
};

/**
 * A chart component that takes a list of values and a list of dates for these values.
 * The component assumes the data lacks data points because some candles may not exist due to
 * low token liquidity or a block explorer failure, so it requires additional props `intervals`, `from`, and `to`
 * to fill the gaps between the existing data points and produce a smooth chart.
 *
 * For example, the component may want to draw 24 candles, but the data only has 15 candles.
 * The component would call the `adaptChart` function, which, under the hood, fills the missing candles
 * for the provided date range with `intervals`, `from`, and `to` props.
 *
 * In a time gap, the `adaptChart` function puts the closes value, e.g. if we know that the price is
 * $1 at 12:00 and $2 at 15:00, the function will assume that the price was $1 at 13:00, and $2 at 14:00.
 */
export const PreviewChart = (props: PreviewChartProps) => {
  const { sign, ...rest } = props;
  const data = adaptData(rest);

  const gradientId = useId();

  // Get min and max values for chart bounds
  const values = data.map(d => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const valueRange = maxValue - minValue || 1; // Avoid division by zero

  // SVG dimensions
  const width = 56; // Width of the chart
  const height = 32; // Height of the chart

  // Map data points to SVG coordinates
  const calculateX = (index: number) => {
    return (index / (data.length - 1)) * width;
  };
  const calculateY = (value: number) => {
    return height - ((value - minValue) / valueRange) * height;
  };

  // Compute the points for the <polyline>
  const linePoints = data
    .map((point, index) => `${calculateX(index)},${calculateY(point.value)}`)
    .join(' ');

  // Compute the points for the area under the line
  const areaPoints =
    `${calculateX(0)},${height} ` + linePoints + ` ${calculateX(data.length - 1)},${height}`;

  if (!data.length) {
    return null;
  }

  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor={getGradientColor(sign)} stopOpacity='0.5' />
          <stop offset='100%' stopColor={getGradientColor(sign)} stopOpacity='0' />
        </linearGradient>
      </defs>

      <polygon strokeLinecap='round' points={areaPoints} fill={`url(#${gradientId})`} />

      <polyline fill='none' strokeWidth='1.5' stroke={getColor(sign)} points={linePoints} />
    </svg>
  );
};
