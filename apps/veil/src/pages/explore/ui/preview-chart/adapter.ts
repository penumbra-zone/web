/* eslint-disable @typescript-eslint/no-non-null-assertion -- we need to break the loop manually */

export interface PreviewChartAdapterOptions {
  /** Array of prices */
  values: number[];
  /**
   * Array of dates where each date corresponds to a certain price from `values`.
   * Always the same length as `values`.
   */
  dates: (string | Date)[];
  /** Amount of expected length for the resulting range array */
  intervals: number;
  /** Starting datetime */
  from: string | Date;
  /** Ending datetime */
  to: string | Date;
}

interface AdapterResult {
  date: Date;
  value: number;
}

/**
 * Constructs an array of date-value pairs that fills the gaps between the existing data points.
 */
export const adaptData = (options: PreviewChartAdapterOptions): AdapterResult[] => {
  const { values, dates, intervals, from, to } = options;

  if (!values.length || !dates.length) {
    return [];
  }

  // Generate equally spaced dates
  const resultDates = generateDates(new Date(from), new Date(to), intervals);

  // Create date-value pairs and sort them by date
  const dateValuePairs = dates.map((date, index) => ({
    date: new Date(date),
    value: values[index]!,
  }));

  dateValuePairs.sort((a, b) => {
    return a.date.getTime() - b.date.getTime();
  });

  // Build the result array
  return resultDates.map(date => {
    const index = findClosestDateIndex(date, dateValuePairs);
    const value = dateValuePairs[index]!.value;
    return { date, value };
  });
};

const generateDates = (from: Date, to: Date, intervals: number): Date[] => {
  if (intervals === 1) {
    return [from];
  }
  const dates = [];
  const fromTime = from.getTime();
  const toTime = to.getTime();
  const step = (toTime - fromTime) / (intervals - 1);

  for (let i = 0; i < intervals; i++) {
    const date = new Date(fromTime + step * i);
    dates.push(date);
  }
  return dates;
};

const findClosestDateIndex = (
  date: Date,
  dateValuePairs: { date: Date; value: number }[],
): number => {
  if (!dateValuePairs.length) {
    return 0;
  }

  const targetTime = date.getTime();
  let low = 0;
  let high = dateValuePairs.length - 1;

  if (targetTime <= dateValuePairs[low]!.date.getTime()) {
    return low;
  }
  if (targetTime >= dateValuePairs[high]!.date.getTime()) {
    return high;
  }

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midTime = dateValuePairs[mid]!.date.getTime();

    if (midTime === targetTime) {
      return mid;
    } else if (midTime < targetTime) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // After the loop, low is the index of the smallest date greater than targetTime
  // high is the index of the largest date less than targetTime

  const lowTime = dateValuePairs[low]!.date.getTime();
  const highTime = dateValuePairs[high]!.date.getTime();

  const lowDiff = Math.abs(lowTime - targetTime);
  const highDiff = Math.abs(highTime - targetTime);

  if (lowDiff < highDiff) {
    return low;
  } else if (lowDiff > highDiff) {
    return high;
  } else {
    // Equal differences, pick the earlier date (high)
    return high;
  }
};
