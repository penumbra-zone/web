import { describe, expect, it } from 'vitest';
import { calculateSpread } from './trace';
import { Trace } from '@/shared/api/server/book/types';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

describe('calculateSpread', () => {
  const createTrace = (price: string): Trace => ({
    price,
    amount: '1.0',
    total: '1.0',
    hops: [] as ValueView[],
  });

  const createOrders = (prices: string[]): Trace[] => prices.map(price => createTrace(price));

  it('returns undefined when sell orders are empty', () => {
    const result = calculateSpread([], createOrders(['1.0']));
    expect(result).toBeUndefined();
  });

  it('returns undefined when buy orders are empty', () => {
    const result = calculateSpread(createOrders(['1.0']), []);
    expect(result).toBeUndefined();
  });

  it('calculates spread correctly for valid orders', () => {
    const sellOrders = createOrders(['1.5', '1.2', '1.0']); // Lowest sell: 1.0
    const buyOrders = createOrders(['0.8', '0.7', '0.6']); // Highest buy: 0.8

    const result = calculateSpread(sellOrders, buyOrders);

    expect(result).toEqual({
      amount: '0.2',
      percentage: '22.22',
      midPrice: '0.9',
    });
  });
  it('handles decimal precision correctly', () => {
    const sellOrders = createOrders(['1.23456789']);
    const buyOrders = createOrders(['1.12345678']);

    const result = calculateSpread(sellOrders, buyOrders);

    expect(result).toEqual({
      amount: '0.11111111',
      percentage: '9.42',
      midPrice: '1.17901234',
    });
  });

  it('works with string numbers in scientific notation', () => {
    const sellOrders = createOrders(['1e-4']);
    const buyOrders = createOrders(['5e-5']);

    const result = calculateSpread(sellOrders, buyOrders);

    // TODO: This feels like the wrong formatting. Should investigate the round library.
    expect(result).toEqual({
      amount: '5.00000000e-5',
      percentage: '66.67',
      midPrice: '7.50000000e-5',
    });
  });
});
