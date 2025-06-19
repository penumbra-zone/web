import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { describe, expect, it } from 'vitest';
import {
  planToPosition,
  simpleLiquidityPositions,
  LiquidityDistributionShape,
  getPositionWeights,
} from './position';
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
    distributionShape: LiquidityDistributionShape.FLAT,
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

    const baseReserves = positions.map(p => pnum(p.reserves?.r1).toNumber()).filter(Boolean);
    const quoteReserves = positions.map(p => pnum(p.reserves?.r2).toNumber()).filter(Boolean);
    const reserves = [...quoteReserves, ...baseReserves];

    // All reserves should be equal
    expect(reserves.every(r => r === reserves[0])).toBe(true);
  });

  it('creates pyramid distribution in PYRAMID mode', () => {
    const positions = simpleLiquidityPositions({
      ...basePlan,
      distributionShape: LiquidityDistributionShape.PYRAMID,
    });

    const baseReserves = positions.map(p => pnum(p.reserves?.r1).toNumber()).filter(Boolean);
    const quoteReserves = positions.map(p => pnum(p.reserves?.r2).toNumber()).filter(Boolean);
    const reserves = [...quoteReserves, ...baseReserves];

    const middleIndex1 = Math.floor(reserves.length / 2);
    const middleIndex2 = Math.ceil(reserves.length / 2);

    const middleReserve1 = reserves[middleIndex1]!;
    const middleReserve2 = reserves[middleIndex2]!;
    const firstReserve = reserves[0]!;
    const lastReserve = reserves[reserves.length - 1]!;

    expect(middleReserve1).toBeGreaterThan(firstReserve);
    expect(middleReserve1).toBeGreaterThan(lastReserve);
    expect(middleReserve2).toBeGreaterThan(firstReserve);
    expect(middleReserve2).toBeGreaterThan(lastReserve);
  });

  it('creates inverted pyramid distribution in INVERTED_PYRAMID mode', () => {
    const positions = simpleLiquidityPositions({
      ...basePlan,
      distributionShape: LiquidityDistributionShape.INVERTED_PYRAMID,
    });

    const baseReserves = positions.map(p => pnum(p.reserves?.r1).toNumber()).filter(Boolean);
    const quoteReserves = positions.map(p => pnum(p.reserves?.r2).toNumber()).filter(Boolean);
    const reserves = [...quoteReserves, ...baseReserves];

    const middleIndex1 = Math.floor(reserves.length / 2);
    const middleIndex2 = Math.ceil(reserves.length / 2);

    const middleReserve1 = reserves[middleIndex1]!;
    const middleReserve2 = reserves[middleIndex2]!;
    const firstReserve = reserves[0]!;
    const lastReserve = reserves[reserves.length - 1]!;

    expect(middleReserve1).toBeLessThan(firstReserve);
    expect(middleReserve1).toBeLessThan(lastReserve);
    expect(middleReserve2).toBeLessThan(firstReserve);
    expect(middleReserve2).toBeLessThan(lastReserve);
  });

  it('maintains total liquidity in FLAT distribution', () => {
    const positions = simpleLiquidityPositions({
      ...basePlan,
      distributionShape: LiquidityDistributionShape.FLAT,
    });

    // Calculate total base and quote liquidity
    const totalBaseLiquidity = positions.reduce(
      (sum, p) => sum + pnum(p.reserves?.r1 ?? 0, basePlan.baseAsset.exponent).toNumber(),
      0,
    );
    const totalQuoteLiquidity = positions.reduce(
      (sum, p) => sum + pnum(p.reserves?.r2 ?? 0, basePlan.quoteAsset.exponent).toNumber(),
      0,
    );

    // Total liquidity should match input (accounting for exponents)
    expect(totalBaseLiquidity).toBeCloseTo(basePlan.baseLiquidity);
    expect(totalQuoteLiquidity).toBeCloseTo(basePlan.quoteLiquidity);
  });

  it('maintains total liquidity in PYRAMID distribution', () => {
    const positions = simpleLiquidityPositions({
      ...basePlan,
      distributionShape: LiquidityDistributionShape.PYRAMID,
    });

    // Calculate total base and quote liquidity
    const totalBaseLiquidity = positions.reduce(
      (sum, p) => sum + pnum(p.reserves?.r1 ?? 0, basePlan.baseAsset.exponent).toNumber(),
      0,
    );
    const totalQuoteLiquidity = positions.reduce(
      (sum, p) => sum + pnum(p.reserves?.r2 ?? 0, basePlan.quoteAsset.exponent).toNumber(),
      0,
    );

    // Total liquidity should match input (accounting for exponents)
    expect(totalBaseLiquidity).toBeCloseTo(basePlan.baseLiquidity);
    expect(totalQuoteLiquidity).toBeCloseTo(basePlan.quoteLiquidity);
  });

  it('maintains total liquidity in INVERTED_PYRAMID distribution', () => {
    const positions = simpleLiquidityPositions({
      ...basePlan,
      distributionShape: LiquidityDistributionShape.INVERTED_PYRAMID,
    });

    // Calculate total base and quote liquidity
    const totalBaseLiquidity = positions.reduce(
      (sum, p) => sum + pnum(p.reserves?.r1 ?? 0, basePlan.baseAsset.exponent).toNumber(),
      0,
    );
    const totalQuoteLiquidity = positions.reduce(
      (sum, p) => sum + pnum(p.reserves?.r2 ?? 0, basePlan.quoteAsset.exponent).toNumber(),
      0,
    );

    // Total liquidity should match input (accounting for exponents)
    expect(totalBaseLiquidity).toBeCloseTo(basePlan.baseLiquidity);
    expect(totalQuoteLiquidity).toBeCloseTo(basePlan.quoteLiquidity);
  });
});

describe('getPositionWeights', () => {
  it('ensures minimum weight of 0.02 for PYRAMID distribution', () => {
    const positions = 10;
    const weights = getPositionWeights(positions, LiquidityDistributionShape.PYRAMID);
    weights.forEach(weight => {
      expect(weight).toBeGreaterThanOrEqual(0.02);
    });
  });

  it('returns correct number of weights', () => {
    const positions = 5;
    const weights = getPositionWeights(positions, LiquidityDistributionShape.FLAT);
    expect(weights).toHaveLength(positions);
  });

  it('returns [1] for single position', () => {
    const weights = getPositionWeights(1, LiquidityDistributionShape.FLAT);
    expect(weights).toEqual([1]);
  });

  it('maintains relative proportions in PYRAMID distribution', () => {
    const positions = 5;
    const weights = getPositionWeights(positions, LiquidityDistributionShape.PYRAMID);

    // Middle position should have highest weight
    const middleIndex = Math.floor(positions / 2);
    const middleWeight = weights[middleIndex]!;
    weights.forEach((weight, i) => {
      if (i !== middleIndex) {
        expect(middleWeight).toBeGreaterThan(weight);
      }
    });
  });

  it('maintains relative proportions in INVERTED_PYRAMID distribution', () => {
    const positions = 5;
    const weights = getPositionWeights(positions, LiquidityDistributionShape.INVERTED_PYRAMID);

    // Edge positions should have higher weights than middle
    const middleIndex = Math.floor(positions / 2);
    const middleWeight = weights[middleIndex]!;
    weights.forEach((weight, i) => {
      if (i === 0 || i === positions - 1) {
        expect(weight).toBeGreaterThan(middleWeight);
      }
    });
  });
});
