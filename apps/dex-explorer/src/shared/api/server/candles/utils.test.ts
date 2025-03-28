import { describe, it, expect } from 'vitest';
import { DurationWindow } from '../../../utils/duration.ts';
import { UTCTimestamp } from 'lightweight-charts';
import { insertEmptyCandles, CandleWithVolume } from './utils';

describe('insertEmptyCandles', () => {
  const window: DurationWindow = '1m';

  it('should return empty array when input data is empty', () => {
    const input: CandleWithVolume[] = [];
    const output = insertEmptyCandles(window, input);
    expect(output).toEqual([]);
  });

  it('should return the same candle when there is only one candle', () => {
    const input: CandleWithVolume[] = [
      {
        ohlc: {
          time: 1609459200 as UTCTimestamp,
          open: 100,
          high: 105,
          low: 95,
          close: 102,
        },
        volume: 100,
      },
    ];
    const output = insertEmptyCandles(window, input);
    expect(output).toEqual(input);
  });

  it('should return the same candles when there are no gaps', () => {
    const input: CandleWithVolume[] = [
      {
        ohlc: {
          time: 1609459200 as UTCTimestamp,
          open: 100,
          high: 105,
          low: 95,
          close: 102,
        },
        volume: 100,
      },
      {
        ohlc: {
          time: 1609459260 as UTCTimestamp,
          open: 102,
          high: 106,
          low: 101,
          close: 104,
        },
        volume: 200,
      },
      {
        ohlc: {
          time: 1609459320 as UTCTimestamp,
          open: 104,
          high: 107,
          low: 103,
          close: 105,
        },
        volume: 300,
      },
    ];
    const output = insertEmptyCandles(window, input);
    expect(output).toEqual(input);
  });

  it('should insert empty candles when there are gaps', () => {
    const input: CandleWithVolume[] = [
      {
        ohlc: {
          time: 1609459200 as UTCTimestamp,
          open: 100,
          high: 105,
          low: 95,
          close: 102,
        },
        volume: 100,
      },
      // Gap of 2 minutes
      {
        ohlc: {
          time: 1609459320 as UTCTimestamp,
          open: 104,
          high: 107,
          low: 103,
          close: 105,
        },
        volume: 300,
      },
    ];
    const expectedOutput: CandleWithVolume[] = [
      {
        ohlc: {
          time: 1609459200 as UTCTimestamp,
          open: 100,
          high: 105,
          low: 95,
          close: 102,
        },
        volume: 100,
      },
      // Inserted empty candle at 1609459260
      {
        ohlc: {
          time: 1609459260 as UTCTimestamp,
          open: 102,
          high: 102,
          low: 102,
          close: 102,
        },
        volume: 0,
      },
      {
        ohlc: {
          time: 1609459320 as UTCTimestamp,
          open: 104,
          high: 107,
          low: 103,
          close: 105,
        },
        volume: 300,
      },
    ];
    const output = insertEmptyCandles(window, input);
    expect(output).toEqual(expectedOutput);
  });

  it('should insert multiple empty candles when multiple gaps exist', () => {
    const input: CandleWithVolume[] = [
      {
        ohlc: {
          time: 1609459200 as UTCTimestamp,
          open: 100,
          high: 105,
          low: 95,
          close: 102,
        },
        volume: 100,
      },
      // Gap of 3 minutes
      {
        ohlc: {
          time: 1609459380 as UTCTimestamp,
          open: 106,
          high: 110,
          low: 105,
          close: 108,
        },
        volume: 200,
      },
    ];
    const expectedOutput: CandleWithVolume[] = [
      {
        ohlc: {
          time: 1609459200 as UTCTimestamp,
          open: 100,
          high: 105,
          low: 95,
          close: 102,
        },
        volume: 100,
      },
      {
        ohlc: {
          time: 1609459260 as UTCTimestamp,
          open: 102,
          high: 102,
          low: 102,
          close: 102,
        },
        volume: 0,
      },
      {
        ohlc: {
          time: 1609459320 as UTCTimestamp,
          open: 102,
          high: 102,
          low: 102,
          close: 102,
        },
        volume: 0,
      },
      {
        ohlc: {
          time: 1609459380 as UTCTimestamp,
          open: 106,
          high: 110,
          low: 105,
          close: 108,
        },
        volume: 200,
      },
    ];
    const output = insertEmptyCandles(window, input);
    expect(output).toEqual(expectedOutput);
  });

  it('should not insert candles if nextTime is not less than candle.time', () => {
    const input: CandleWithVolume[] = [
      {
        ohlc: {
          time: 1609459200 as UTCTimestamp,
          open: 100,
          high: 105,
          low: 95,
          close: 102,
        },
        volume: 100,
      },
      // nextTime after addDurationWindow would be 1609459260
      {
        ohlc: {
          time: 1609459260 as UTCTimestamp,
          open: 102,
          high: 106,
          low: 101,
          close: 104,
        },
        volume: 200,
      },
      // No gap here
      {
        ohlc: {
          time: 1609459320 as UTCTimestamp,
          open: 104,
          high: 107,
          low: 103,
          close: 105,
        },
        volume: 300,
      },
    ];
    const output = insertEmptyCandles(window, input);
    expect(output).toEqual(input);
  });

  it('should handle multiple insertions and existing candles correctly', () => {
    const input: CandleWithVolume[] = [
      {
        ohlc: {
          time: 1609459200 as UTCTimestamp,
          open: 100,
          high: 105,
          low: 95,
          close: 102,
        },
        volume: 100,
      }, // 00:00
      {
        ohlc: {
          time: 1609459320 as UTCTimestamp,
          open: 104,
          high: 107,
          low: 103,
          close: 105,
        },
        volume: 300,
      }, // 00:02
      {
        ohlc: {
          time: 1609459440 as UTCTimestamp,
          open: 105,
          high: 108,
          low: 104,
          close: 107,
        },
        volume: 400,
      }, // 00:04
    ];
    const expectedOutput: CandleWithVolume[] = [
      {
        ohlc: {
          time: 1609459200 as UTCTimestamp,
          open: 100,
          high: 105,
          low: 95,
          close: 102,
        },
        volume: 100,
      }, // 00:00
      {
        ohlc: {
          time: 1609459260 as UTCTimestamp,
          open: 102,
          high: 102,
          low: 102,
          close: 102,
        },
        volume: 0,
      }, // 00:01
      {
        ohlc: {
          time: 1609459320 as UTCTimestamp,
          open: 104,
          high: 107,
          low: 103,
          close: 105,
        },
        volume: 300,
      }, // 00:02
      {
        ohlc: {
          time: 1609459380 as UTCTimestamp,
          open: 105,
          high: 105,
          low: 105,
          close: 105,
        },
        volume: 0,
      }, // 00:03
      {
        ohlc: {
          time: 1609459440 as UTCTimestamp,
          open: 105,
          high: 108,
          low: 104,
          close: 107,
        },
        volume: 400,
      }, // 00:04
    ];
    const output = insertEmptyCandles(window, input);
    expect(output).toEqual(expectedOutput);
  });

  it('should insert multiple empty candles across multiple gaps', () => {
    const input: CandleWithVolume[] = [
      {
        ohlc: {
          time: 1609459200 as UTCTimestamp,
          open: 100,
          high: 105,
          low: 95,
          close: 102,
        },
        volume: 100,
      }, // 00:00
      {
        ohlc: {
          time: 1609459380 as UTCTimestamp,
          open: 106,
          high: 110,
          low: 105,
          close: 108,
        },
        volume: 200,
      }, // 00:03
      {
        ohlc: {
          time: 1609459560 as UTCTimestamp,
          open: 108,
          high: 112,
          low: 107,
          close: 110,
        },
        volume: 300,
      }, // 00:06
      {
        ohlc: {
          time: 1609459740 as UTCTimestamp,
          open: 110,
          high: 115,
          low: 109,
          close: 113,
        },
        volume: 400,
      }, // 00:09
    ];

    const expectedOutput: CandleWithVolume[] = [
      // Original Candle 1
      {
        ohlc: {
          time: 1609459200 as UTCTimestamp,
          open: 100,
          high: 105,
          low: 95,
          close: 102,
        },
        volume: 100,
      }, // 00:00

      // Inserted Empty Candles for Gap between 00:00 and 00:03
      {
        ohlc: {
          time: 1609459260 as UTCTimestamp,
          open: 102,
          high: 102,
          low: 102,
          close: 102,
        },
        volume: 0,
      }, // 00:01
      {
        ohlc: {
          time: 1609459320 as UTCTimestamp,
          open: 102,
          high: 102,
          low: 102,
          close: 102,
        },
        volume: 0,
      }, // 00:02

      // Original Candle 2
      {
        ohlc: {
          time: 1609459380 as UTCTimestamp,
          open: 106,
          high: 110,
          low: 105,
          close: 108,
        },
        volume: 200,
      }, // 00:03

      // Inserted Empty Candles for Gap between 00:03 and 00:07
      {
        ohlc: {
          time: 1609459440 as UTCTimestamp,
          open: 108,
          high: 108,
          low: 108,
          close: 108,
        },
        volume: 0,
      }, // 00:04
      {
        ohlc: {
          time: 1609459500 as UTCTimestamp,
          open: 108,
          high: 108,
          low: 108,
          close: 108,
        },
        volume: 0,
      }, // 00:05
      {
        ohlc: {
          time: 1609459560 as UTCTimestamp,
          open: 108,
          high: 112,
          low: 107,
          close: 110,
        },
        volume: 300,
      }, // 00:06

      // Inserted Empty Candle for Gap between 00:06 and 00:09
      {
        ohlc: {
          time: 1609459620 as UTCTimestamp,
          open: 110,
          high: 110,
          low: 110,
          close: 110,
        },
        volume: 0,
      }, // 00:07
      {
        ohlc: {
          time: 1609459680 as UTCTimestamp,
          open: 110,
          high: 110,
          low: 110,
          close: 110,
        },
        volume: 0,
      }, // 00:08

      // Original Candle 4
      {
        ohlc: {
          time: 1609459740 as UTCTimestamp,
          open: 110,
          high: 115,
          low: 109,
          close: 113,
        },
        volume: 400,
      }, // 00:09
    ];

    const output = insertEmptyCandles(window, input);
    expect(output).toEqual(expectedOutput);
  });
});
