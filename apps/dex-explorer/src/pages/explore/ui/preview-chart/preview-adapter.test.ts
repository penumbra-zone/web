import { describe, it, expect } from 'vitest';
import { adaptData, PreviewChartAdapterOptions } from './adapter';

describe('preview-chart', () => {
  it('adapts the data correctly', () => {
    const adaptedData = adaptData(TEST_DATA_1);
    expect(adaptedData).toStrictEqual(RESULT_DATA_1);
  });

  // Real-life case with 15/24 candles – the function fills is up to 24 candles
  it('works on real data', () => {
    const adaptedData = adaptData(TEST_DATA_2);
    expect(adaptedData).toStrictEqual(RESULT_DATA_2);
  });

  it('handles mid data', () => {
    const adaptedData = adaptData(TEST_DATA_3);
    expect(adaptedData).toStrictEqual(RESULT_DATA_3);
  });
});

const TEST_DATA_1: PreviewChartAdapterOptions = {
  values: [1, 3, 2],
  dates: [
    new Date('2024-12-01T12:00:00'),
    new Date('2024-12-01T14:00:00'),
    new Date('2024-12-01T16:00:00'),
  ],
  intervals: 6,
  from: new Date('2024-12-01T11:00:00'),
  to: new Date('2024-12-01T16:00:00'),
};

const RESULT_DATA_1 = [
  {
    date: new Date('2024-12-01T11:00:00'),
    value: 1,
  },
  {
    date: new Date('2024-12-01T12:00:00'),
    value: 1,
  },
  {
    date: new Date('2024-12-01T13:00:00'),
    value: 1,
  },
  {
    date: new Date('2024-12-01T14:00:00'),
    value: 3,
  },
  {
    date: new Date('2024-12-01T15:00:00'),
    value: 3,
  },
  {
    date: new Date('2024-12-01T16:00:00'),
    value: 2,
  },
];

// Real life data - 15 values out of 24 hours
const TEST_DATA_2: PreviewChartAdapterOptions = {
  values: [
    1.0415348817880274, 0.9839694433333334, 1.0392439608148876, 1.0283755324651125,
    0.9512070351758792, 1, 1, 1.0095638190954774, 1.0068517034068136, 1.0262454909819638,
    1.0262454909819638, 0.9901115577889448, 0.9802307117735226, 0.9867328, 0.9641784983498348,
  ],
  dates: [
    '2024-11-28T10:00:00.000Z',
    '2024-11-28T11:00:00.000Z',
    '2024-11-28T12:00:00.000Z',
    '2024-11-28T13:00:00.000Z',
    '2024-11-28T16:00:00.000Z',
    '2024-11-28T17:00:00.000Z',
    '2024-11-28T18:00:00.000Z',
    '2024-11-28T19:00:00.000Z',
    '2024-11-28T20:00:00.000Z',
    '2024-11-28T21:00:00.000Z',
    '2024-11-28T22:00:00.000Z',
    '2024-11-29T00:00:00.000Z',
    '2024-11-29T04:00:00.000Z',
    '2024-11-29T07:00:00.000Z',
    '2024-11-29T09:00:00.000Z',
  ],
  intervals: 24,
  from: '2024-11-28T09:38:10.978Z',
  to: '2024-11-29T09:38:10.978Z',
};

const RESULT_DATA_2 = [
  {
    date: new Date('2024-11-28T09:38:10.978Z'),
    value: 1.0415348817880274,
  },
  {
    date: new Date('2024-11-28T10:40:47.499Z'),
    value: 0.9839694433333334,
  },
  {
    date: new Date('2024-11-28T11:43:24.021Z'),
    value: 1.0392439608148876,
  },
  {
    date: new Date('2024-11-28T12:46:00.543Z'),
    value: 1.0283755324651125,
  },
  {
    date: new Date('2024-11-28T13:48:37.064Z'),
    value: 1.0283755324651125,
  },
  {
    date: new Date('2024-11-28T14:51:13.586Z'),
    value: 0.9512070351758792,
  },
  {
    date: new Date('2024-11-28T15:53:50.108Z'),
    value: 0.9512070351758792,
  },
  {
    date: new Date('2024-11-28T16:56:26.630Z'),
    value: 1,
  },
  {
    date: new Date('2024-11-28T17:59:03.151Z'),
    value: 1,
  },
  {
    date: new Date('2024-11-28T19:01:39.673Z'),
    value: 1.0095638190954774,
  },
  {
    date: new Date('2024-11-28T20:04:16.195Z'),
    value: 1.0068517034068136,
  },
  {
    date: new Date('2024-11-28T21:06:52.717Z'),
    value: 1.0262454909819638,
  },
  {
    date: new Date('2024-11-28T22:09:29.238Z'),
    value: 1.0262454909819638,
  },
  {
    date: new Date('2024-11-28T23:12:05.760Z'),
    value: 0.9901115577889448,
  },
  {
    date: new Date('2024-11-29T00:14:42.282Z'),
    value: 0.9901115577889448,
  },
  {
    date: new Date('2024-11-29T01:17:18.804Z'),
    value: 0.9901115577889448,
  },
  {
    date: new Date('2024-11-29T02:19:55.325Z'),
    value: 0.9802307117735226,
  },
  {
    date: new Date('2024-11-29T03:22:31.847Z'),
    value: 0.9802307117735226,
  },
  {
    date: new Date('2024-11-29T04:25:08.369Z'),
    value: 0.9802307117735226,
  },
  {
    date: new Date('2024-11-29T05:27:44.891Z'),
    value: 0.9802307117735226,
  },
  {
    date: new Date('2024-11-29T06:30:21.412Z'),
    value: 0.9867328,
  },
  {
    date: new Date('2024-11-29T07:32:57.934Z'),
    value: 0.9867328,
  },
  {
    date: new Date('2024-11-29T08:35:34.456Z'),
    value: 0.9641784983498348,
  },
  {
    date: new Date('2024-11-29T09:38:10.978Z'),
    value: 0.9641784983498348,
  },
];

const TEST_DATA_3: PreviewChartAdapterOptions = {
  values: [1, 3],
  dates: [new Date('2024-12-01T12:00:00'), new Date('2024-12-01T14:00:00')],
  intervals: 3,
  from: new Date('2024-12-01T12:00:00'),
  to: new Date('2024-12-01T14:00:00'),
};

const RESULT_DATA_3 = [
  {
    date: new Date('2024-12-01T08:00:00.000Z'),
    value: 1,
  },
  // This is a mid-data generated from the adapter function
  {
    date: new Date('2024-12-01T09:00:00.000Z'),
    value: 1,
  },
  {
    date: new Date('2024-12-01T10:00:00.000Z'),
    value: 3,
  },
];
