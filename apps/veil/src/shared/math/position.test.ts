import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { describe, expect, it } from 'vitest';
import { planToPosition, simpleLiquidityPositions, LiquidityDistributionShape } from './position';
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

describe('simpleLiquidityPositions', () => {
  const basePlan = {
    baseAsset: {
      id: ASSET_A,
      exponent: 6,
    },
    quoteAsset: {
      id: ASSET_B,
      exponent: 6,
    },
    baseLiquidity: 1000,
    quoteLiquidity: 1000,
    upperPrice: 2.0,
    lowerPrice: 1.0,
    marketPrice: 1.5,
    feeBps: 100,
    positions: 20,
  };

  it('creates correct number of positions', () => {
    const positions = simpleLiquidityPositions(basePlan);
    expect(positions).toHaveLength(20);
  });

  it('distributes liquidity evenly in FLAT mode', () => {
    const positions = simpleLiquidityPositions({
      ...basePlan,
      distributionShape: LiquidityDistributionShape.FLAT,
    });

    // Check that all positions have equal liquidity
    const baseReserves = positions.map(p => pnum(p.reserves?.r1).toNumber());
    const quoteReserves = positions.map(p => pnum(p.reserves?.r2).toNumber());

    // All non-zero base reserves should be equal
    const nonZeroBaseReserves = baseReserves.filter(r => r > 0);
    expect(nonZeroBaseReserves.every(r => r === nonZeroBaseReserves[0])).toBe(true);

    // All non-zero quote reserves should be equal
    const nonZeroQuoteReserves = quoteReserves.filter(r => r > 0);
    expect(nonZeroQuoteReserves.every(r => r === nonZeroQuoteReserves[0])).toBe(true);
  });

  it('creates pyramid distribution in PYRAMID mode', () => {
    const positions = simpleLiquidityPositions({
      ...basePlan,
      distributionShape: LiquidityDistributionShape.PYRAMID,
    });

    // Get reserves for positions
    const baseReserves = positions.map(p => pnum(p.reserves?.r1 ?? 0).toNumber());
    const quoteReserves = positions.map(p => pnum(p.reserves?.r2 ?? 0).toNumber());

    // For base reserves (upper range), check that middle positions have more liquidity
    const upperRangeBaseReserves = baseReserves.filter(r => r > 0);
    if (upperRangeBaseReserves.length > 0) {
      const middleIndex = Math.floor(upperRangeBaseReserves.length / 2);
      const middleBaseReserve = upperRangeBaseReserves[middleIndex];
      const firstBaseReserve = upperRangeBaseReserves[0];
      const lastBaseReserve = upperRangeBaseReserves[upperRangeBaseReserves.length - 1];

      if (firstBaseReserve !== undefined && lastBaseReserve !== undefined) {
        expect(middleBaseReserve).toBeGreaterThan(firstBaseReserve);
        expect(middleBaseReserve).toBeGreaterThan(lastBaseReserve);
      }
    }

    // For quote reserves (lower range), check that middle positions have more liquidity
    const lowerRangeQuoteReserves = quoteReserves.filter(r => r > 0);
    if (lowerRangeQuoteReserves.length > 0) {
      const middleIndex = Math.floor(lowerRangeQuoteReserves.length / 2);
      const middleQuoteReserve = lowerRangeQuoteReserves[middleIndex];
      const firstQuoteReserve = lowerRangeQuoteReserves[0];
      const lastQuoteReserve = lowerRangeQuoteReserves[lowerRangeQuoteReserves.length - 1];

      if (firstQuoteReserve !== undefined && lastQuoteReserve !== undefined) {
        expect(middleQuoteReserve).toBeGreaterThan(firstQuoteReserve);
        expect(middleQuoteReserve).toBeGreaterThan(lastQuoteReserve);
      }
    }
  });

  it('creates inverted pyramid distribution in INVERTED_PYRAMID mode', () => {
    const positions = simpleLiquidityPositions({
      ...basePlan,
      distributionShape: LiquidityDistributionShape.INVERTED_PYRAMID,
    });

    // Get reserves for positions
    const baseReserves = positions.map(p => pnum(p.reserves?.r1 ?? 0).toNumber());
    const quoteReserves = positions.map(p => pnum(p.reserves?.r2 ?? 0).toNumber());

    // For base reserves (upper range), check that edge positions have more liquidity
    const upperRangeBaseReserves = baseReserves.filter(r => r > 0);
    if (upperRangeBaseReserves.length > 0) {
      const middleIndex = Math.floor(upperRangeBaseReserves.length / 2);
      const middleBaseReserve = upperRangeBaseReserves[middleIndex];
      const firstBaseReserve = upperRangeBaseReserves[0];
      const lastBaseReserve = upperRangeBaseReserves[upperRangeBaseReserves.length - 1];

      if (firstBaseReserve !== undefined && lastBaseReserve !== undefined) {
        expect(middleBaseReserve).toBeLessThan(firstBaseReserve);
        expect(middleBaseReserve).toBeLessThan(lastBaseReserve);
      }
    }

    // For quote reserves (lower range), check that edge positions have more liquidity
    const lowerRangeQuoteReserves = quoteReserves.filter(r => r > 0);
    if (lowerRangeQuoteReserves.length > 0) {
      const middleIndex = Math.floor(lowerRangeQuoteReserves.length / 2);
      const middleQuoteReserve = lowerRangeQuoteReserves[middleIndex];
      const firstQuoteReserve = lowerRangeQuoteReserves[0];
      const lastQuoteReserve = lowerRangeQuoteReserves[lowerRangeQuoteReserves.length - 1];

      if (firstQuoteReserve !== undefined && lastQuoteReserve !== undefined) {
        expect(middleQuoteReserve).toBeLessThan(firstQuoteReserve);
        expect(middleQuoteReserve).toBeLessThan(lastQuoteReserve);
      }
    }
  });

  it('maintains total liquidity across all distribution shapes', () => {
    const shapes = [
      LiquidityDistributionShape.FLAT,
      LiquidityDistributionShape.PYRAMID,
      LiquidityDistributionShape.INVERTED_PYRAMID,
    ];

    shapes.forEach(shape => {
      const positions = simpleLiquidityPositions({
        ...basePlan,
        distributionShape: shape,
      });

      // Calculate total base and quote liquidity
      const totalBaseLiquidity = positions.reduce(
        (sum, p) => sum + pnum(p.reserves?.r1 ?? 0).toNumber(),
        0,
      );
      const totalQuoteLiquidity = positions.reduce(
        (sum, p) => sum + pnum(p.reserves?.r2 ?? 0).toNumber(),
        0,
      );

      // Total liquidity should match input (accounting for exponents)
      expect(totalBaseLiquidity).toBeCloseTo(
        basePlan.baseLiquidity * 10 ** basePlan.baseAsset.exponent,
      );
      expect(totalQuoteLiquidity).toBeCloseTo(
        basePlan.quoteLiquidity * 10 ** basePlan.quoteAsset.exponent,
      );
    });
  });
});
