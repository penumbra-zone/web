import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { describe, expect, it } from 'vitest';
import { planToPosition } from './position';
import { pnum } from '@penumbra-zone/types/pnum';
import { Position } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

const ASSET_A = new AssetId({ inner: new Uint8Array(Array(32).fill(0xaa)) });
const ASSET_B = new AssetId({ inner: new Uint8Array(Array(32).fill(0xbb)) });

const getPrice = (position: Position): number => {
  return pnum(position.phi?.component?.p).toNumber() / pnum(position.phi?.component?.q).toNumber();
};

describe('planToPosition', () => {
  it('works for plans with no exponent', () => {
    const position = planToPosition({
      baseAsset: {
        id: ASSET_A,
        exponent: 0,
      },
      quoteAsset: {
        id: ASSET_B,
        exponent: 0,
      },
      price: 20.5,
      feeBps: 100,
      baseReserves: 1000,
      quoteReserves: 2000,
    });
    expect(position.phi?.component?.fee).toEqual(100);
    expect(getPrice(position)).toEqual(20.5);
    expect(pnum(position.reserves?.r1).toNumber()).toEqual(1000);
    expect(pnum(position.reserves?.r2).toNumber()).toEqual(2000);
  });

  it('works for plans with identical exponent', () => {
    const position = planToPosition({
      baseAsset: {
        id: ASSET_A,
        exponent: 6,
      },
      quoteAsset: {
        id: ASSET_B,
        exponent: 6,
      },
      price: 12.34,
      feeBps: 100,
      baseReserves: 5,
      quoteReserves: 7,
    });
    expect(position.phi?.component?.fee).toEqual(100);
    expect(getPrice(position)).toEqual(12.34);
    expect(pnum(position.reserves?.r1).toNumber()).toEqual(5e6);
    expect(pnum(position.reserves?.r2).toNumber()).toEqual(7e6);
  });

  it('works for plans with different exponents', () => {
    const position = planToPosition({
      baseAsset: {
        id: ASSET_A,
        exponent: 6,
      },
      quoteAsset: {
        id: ASSET_B,
        exponent: 8,
      },
      price: 12.34,
      feeBps: 100,
      baseReserves: 5,
      quoteReserves: 7,
    });
    expect(position.phi?.component?.fee).toEqual(100);
    expect(getPrice(position) * 10 ** (6 - 8)).toEqual(12.34);
    expect(pnum(position.reserves?.r1).toNumber()).toEqual(5e6);
    expect(pnum(position.reserves?.r2).toNumber()).toEqual(7e8);
  });
});

describe('renderPositions', () => {
  it('works for plans with no exponent', () => {
    const position = planToPosition({
      baseAsset: {
        id: ASSET_A,
        exponent: 0,
      },
      quoteAsset: {
        id: ASSET_B,
        exponent: 0,
      },
      price: 20.5,
      feeBps: 100,
      baseReserves: 1000,
      quoteReserves: 2000,
    });
    expect(position.phi?.component?.fee).toEqual(100);
    expect(getPrice(position)).toEqual(20.5);
    expect(pnum(position.reserves?.r1).toNumber()).toEqual(1000);
    expect(pnum(position.reserves?.r2).toNumber()).toEqual(2000);
  });

  it('works for plans with identical exponent', () => {
    const position = planToPosition({
      baseAsset: {
        id: ASSET_A,
        exponent: 6,
      },
      quoteAsset: {
        id: ASSET_B,
        exponent: 6,
      },
      price: 12.34,
      feeBps: 100,
      baseReserves: 5,
      quoteReserves: 7,
    });
    expect(position.phi?.component?.fee).toEqual(100);
    expect(getPrice(position)).toEqual(12.34);
    expect(pnum(position.reserves?.r1).toNumber()).toEqual(5e6);
    expect(pnum(position.reserves?.r2).toNumber()).toEqual(7e6);
  });

  it('works for plans with different exponents', () => {
    const position = planToPosition({
      baseAsset: {
        id: ASSET_A,
        exponent: 6,
      },
      quoteAsset: {
        id: ASSET_B,
        exponent: 8,
      },
      price: 12.34,
      feeBps: 100,
      baseReserves: 5,
      quoteReserves: 7,
    });
    expect(position.phi?.component?.fee).toEqual(100);
    expect(getPrice(position) * 10 ** (6 - 8)).toEqual(12.34);
    expect(pnum(position.reserves?.r1).toNumber()).toEqual(5e6);
    expect(pnum(position.reserves?.r2).toNumber()).toEqual(7e8);
  });
});
