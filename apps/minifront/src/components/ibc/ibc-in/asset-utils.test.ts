import { describe, expect, test } from 'vitest';
import { fromDisplayAmount, toDisplayAmount } from './asset-utils';

const asset = {
  denom_units: [
    { denom: 'osmo', exponent: 6 },
    { denom: 'uosmo', exponent: 0 },
  ],
  base: 'uosmo',
  name: 'Osmosis',
  display: 'osmo',
  symbol: 'OSMO',
};

describe('toDisplayAmount', () => {
  test('converts uosmo to osmo correctly', () => {
    expect(toDisplayAmount(asset, { denom: 'uosmo', amount: '41000000' })).toEqual('41');
  });

  test('high precision conversion from uosmo to osmo', () => {
    expect(toDisplayAmount(asset, { denom: 'uosmo', amount: '123456789012345' })).toEqual(
      '123456789.012345',
    );
  });

  test('coin denom not found in asset denom_units', () => {
    expect(toDisplayAmount(asset, { denom: 'xosmo', amount: '1000000' })).toEqual('1000000');
  });

  test('zero amount conversion from uosmo to osmo', () => {
    expect(toDisplayAmount(asset, { denom: 'uosmo', amount: '0' })).toEqual('0');
  });
});

describe('fromDisplayAmount', () => {
  test('converts osmo to uosmo correctly for a whole number', () => {
    const result = fromDisplayAmount(asset, 'osmo', '1');
    expect(result).toEqual({ denom: 'uosmo', amount: '1000000' });
  });

  test('converts osmo to uosmo correctly for a decimal number', () => {
    const result = fromDisplayAmount(asset, 'osmo', '0.5');
    expect(result).toEqual({ denom: 'uosmo', amount: '500000' });
  });

  test('handles large numbers', () => {
    const result = fromDisplayAmount(asset, 'osmo', '123456');
    expect(result).toEqual({ denom: 'uosmo', amount: '123456000000' });
  });

  test('converts when display amount is zero', () => {
    const result = fromDisplayAmount(asset, 'osmo', '0');
    expect(result).toEqual({ denom: 'uosmo', amount: '0' });
  });

  test('returns input amount if display exponent is undefined', () => {
    const result = fromDisplayAmount(asset, 'xosmo', '100');
    expect(result).toEqual({ denom: 'xosmo', amount: '100' });
  });

  test('defaults base exponent to zero when not found', () => {
    const result = fromDisplayAmount(asset, 'osmo', '100');
    expect(result).toEqual({ denom: 'uosmo', amount: '100000000' });
  });
});
