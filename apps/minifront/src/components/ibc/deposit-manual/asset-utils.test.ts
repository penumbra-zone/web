import { describe, expect, test } from 'vitest';
import { fromDisplayAmount, toDisplayAmount } from './asset-utils';
import { bigNumConfig } from '@penumbra-zone/types/lo-hi';
import { BigNumber } from 'bignumber.js';
import { Asset } from '@chain-registry/types';

BigNumber.config(bigNumConfig);

const osmoMetadata: Asset = {
  denom_units: [
    { denom: 'osmo', exponent: 6 },
    { denom: 'uosmo', exponent: 0 },
  ],
  base: 'uosmo',
  name: 'Osmosis',
  display: 'osmo',
  symbol: 'OSMO',
  type_asset: 'sdk.coin',
};

const usdyMetadata: Asset = {
  denom_units: [
    {
      denom: 'ausdy',
      exponent: 0,
      aliases: ['attousdy'],
    },
    {
      denom: 'usdy',
      exponent: 18,
    },
  ],
  base: 'ausdy',
  display: 'usdy',
  name: 'Ondo US Dollar Yield',
  symbol: 'USDY',
  type_asset: 'sdk.coin',
};

describe('toDisplayAmount', () => {
  test('converts uosmo to osmo correctly', () => {
    expect(toDisplayAmount(osmoMetadata, { denom: 'uosmo', amount: '41000000' })).toEqual('41');
  });

  test('high precision conversion from uosmo to osmo', () => {
    expect(toDisplayAmount(osmoMetadata, { denom: 'uosmo', amount: '123456789012345' })).toEqual(
      '123456789.012345',
    );
  });

  test('coin denom not found in asset denom_units', () => {
    expect(toDisplayAmount(osmoMetadata, { denom: 'xosmo', amount: '1000000' })).toEqual('1000000');
  });

  test('zero amount conversion from uosmo to osmo', () => {
    expect(toDisplayAmount(osmoMetadata, { denom: 'uosmo', amount: '0' })).toEqual('0');
  });
});

describe('fromDisplayAmount', () => {
  test('converts osmo to uosmo correctly for a whole number', () => {
    const result = fromDisplayAmount(osmoMetadata, 'osmo', '1');
    expect(result).toEqual({ denom: 'uosmo', amount: '1000000' });
  });

  test('converts osmo to uosmo correctly for a decimal number', () => {
    const result = fromDisplayAmount(osmoMetadata, 'osmo', '0.5');
    expect(result).toEqual({ denom: 'uosmo', amount: '500000' });
  });

  test('handles large numbers', () => {
    const result = fromDisplayAmount(osmoMetadata, 'osmo', '123456');
    expect(result).toEqual({ denom: 'uosmo', amount: '123456000000' });
  });

  test('converts when display amount is zero', () => {
    const result = fromDisplayAmount(osmoMetadata, 'osmo', '0');
    expect(result).toEqual({ denom: 'uosmo', amount: '0' });
  });

  test('returns input amount if display exponent is undefined', () => {
    const result = fromDisplayAmount(osmoMetadata, 'xosmo', '100');
    expect(result).toEqual({ denom: 'xosmo', amount: '100' });
  });

  test('defaults base exponent to zero when base exponent not found in denom units array', () => {
    const noExponentForBase: Asset = {
      denom_units: [{ denom: 'osmo', exponent: 6 }],
      base: 'uosmo',
      name: 'Osmosis',
      display: 'osmo',
      symbol: 'OSMO',
      type_asset: 'sdk.coin',
    };
    const result = fromDisplayAmount(noExponentForBase, 'osmo', '100');
    expect(result).toEqual({ denom: 'uosmo', amount: '100000000' });
  });

  test('should work with very large numbers', () => {
    const result = fromDisplayAmount(usdyMetadata, 'usdy', '112');
    expect(result).toEqual({ denom: 'ausdy', amount: '112000000000000000000' });
  });
});
