import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  Position,
  PositionState,
  PositionState_PositionStateEnum,
  TradingPair,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { pnum } from '@penumbra-zone/types/pnum';
import BigNumber from 'bignumber.js';

export const compareAssetId = (a: AssetId, b: AssetId): number => {
  // The asset ids are serialized using LE, so this is checking the MSB.
  for (let i = 31; i >= 0; --i) {
    const a_i = a.inner[i] ?? -Infinity;
    const b_i = b.inner[i] ?? -Infinity;
    if (a_i < b_i) {
      return -1;
    }
    if (b_i < a_i) {
      return 1;
    }
  }
  return 0;
};

/**
 * A slimmed-down representation for assets, restricted to what we need for math.
 *
 * We have an identifier for the kind of asset, which is needed to construct a position,
 * and an exponent E, such that 10**E units of the base denom constitute a unit of the display denom.
 *
 * For example, 10**6 uUSD make up one USD.
 */
export interface Asset {
  id: AssetId;
  exponent: number;
}

/**
 * A basic plan to create a position.
 *
 * This can then be passed to `planToPosition` to fill out the position.
 */
export interface PositionPlan {
  baseAsset: Asset;
  quoteAsset: Asset;
  /** How much of the quote asset do you get for each unit of the base asset?
   *
   * This will be in terms of the *display* denoms, e.g. USD / UM.
   */
  price: number;
  /** The fee, in [0, 10_000]*/
  feeBps: number;
  /** How much of the base asset we want to provide, in display units. */
  baseReserves: number;
  /** How much of the quote asset we want to provide, in display units. */
  quoteReserves: number;
}

const priceToPQ = (
  price: number,
  pExponent: number,
  qExponent: number,
): { p: Amount; q: Amount } => {
  // e.g. price     = X USD / UM
  //      basePrice = Y uUM / uUSD = X USD / UM * uUSD / USD * UM / uUM
  //                = X * 10 ** qExponent * 10 ** -pExponent
  const basePrice = new BigNumber(price).times(new BigNumber(10).pow(qExponent - pExponent));

  // USD / UM -> [USD, UM], with a given precision.
  // Then, we want the invariant that p * UM + q * USD = constant, so
  let [p, q] = basePrice.toFraction();
  // These can be higher, but this gives us some leg room.
  const max_p_or_q = new BigNumber(10).pow(20);
  while (p.isGreaterThanOrEqualTo(max_p_or_q) || q.isGreaterThanOrEqualTo(max_p_or_q)) {
    p = p.shiftedBy(-1);
    q = q.shiftedBy(-1);
  }
  p = p.plus(Number(p.isEqualTo(0)));
  q = q.plus(Number(p.isEqualTo(0)));
  return { p: pnum(BigInt(p.toFixed(0))).toAmount(), q: pnum(BigInt(q.toFixed(0))).toAmount() };
};

/**
 * Convert a plan into a position.
 *
 * Try using `rangeLiquidityPositions` or `limitOrderPosition` instead, with this method existing
 * as an escape hatch in case any of those use cases aren't sufficient.
 */
export const planToPosition = (plan: PositionPlan): Position => {
  const { p: rawP, q: rawQ } = priceToPQ(
    plan.price,
    plan.baseAsset.exponent,
    plan.quoteAsset.exponent,
  );
  const rawA1 = plan.baseAsset;
  const rawA2 = plan.quoteAsset;
  const rawR1 = pnum(plan.baseReserves, plan.baseAsset.exponent).toAmount();
  const rawR2 = pnum(plan.quoteReserves, plan.quoteAsset.exponent).toAmount();

  const correctOrder = compareAssetId(plan.baseAsset.id, plan.quoteAsset.id) <= 0;
  const [[p, q], [r1, r2], [a1, a2]] = correctOrder
    ? [
        [rawP, rawQ],
        [rawR1, rawR2],
        [rawA1, rawA2],
      ]
    : [
        [rawQ, rawP],
        [rawR2, rawR1],
        [rawA2, rawA1],
      ];

  return new Position({
    phi: {
      component: {
        fee: plan.feeBps,
        p: pnum(p).toAmount(),
        q: pnum(q).toAmount(),
      },
      pair: new TradingPair({
        asset1: a1.id,
        asset2: a2.id,
      }),
    },
    nonce: crypto.getRandomValues(new Uint8Array(32)),
    state: new PositionState({ state: PositionState_PositionStateEnum.OPENED }),
    reserves: { r1, r2 },
    closeOnFill: false,
  });
};

/**
 * A range liquidity plan provides for creating multiple positions across a range of prices.
 *
 * This plan attempts to distribute reserves across equally spaced price points.
 *
 * It needs to know the market price, to know when to switch from positions that sell the quote
 * asset, to positions that buy the quote asset.
 *
 * All prices are in terms of quoteAsset / baseAsset, in display units.
 */
interface RangeLiquidityPlan {
  baseAsset: Asset;
  quoteAsset: Asset;
  targetLiquidity: number;
  upperPrice: number;
  lowerPrice: number;
  marketPrice: number;
  feeBps: number;
  positions: number;
}

/** Given a plan for providing range liquidity, create all the necessary positions to accomplish the plan. */
export const rangeLiquidityPositions = (plan: RangeLiquidityPlan): Position[] => {
  // The step width is positions-1 because it's between the endpoints
  // |---|---|---|---|
  // 0   1   2   3   4
  //   0   1   2   3
  const stepWidth = (plan.upperPrice - plan.lowerPrice) / plan.positions;
  return Array.from({ length: plan.positions }, (_, i) => {
    const price = plan.lowerPrice + i * stepWidth;

    let baseReserves: number;
    let quoteReserves: number;
    if (price < plan.marketPrice) {
      // If the price is < market price, then people *paying* that price are getting a good deal,
      // and receiving the base asset in exchange, so we don't want to offer them any of that.
      baseReserves = 0;
      quoteReserves = plan.targetLiquidity / plan.positions;
    } else {
      // Conversely, when price > market price, then the people that are selling the base asset,
      // receiving the quote asset in exchange are getting a good deal, so we don't want to offer that.
      baseReserves = plan.targetLiquidity / plan.positions / price;
      quoteReserves = 0;
    }

    return planToPosition({
      baseAsset: plan.baseAsset,
      quoteAsset: plan.quoteAsset,
      feeBps: plan.feeBps,
      price,
      baseReserves,
      quoteReserves,
    });
  });
};

/** A limit order plan attempts to buy or sell the baseAsset at a given price.
 *
 * This price is always in terms of quoteAsset / baseAsset.
 *
 * The input is the quote asset when buying, and the base asset when selling, and in display units.
 */
interface LimitOrderPlan {
  buy: 'buy' | 'sell';
  price: number;
  input: number;
  baseAsset: Asset;
  quoteAsset: Asset;
}

export const limitOrderPosition = (plan: LimitOrderPlan): Position => {
  let baseReserves: number;
  let quoteReserves: number;
  if (plan.buy === 'buy') {
    baseReserves = 0;
    quoteReserves = plan.input;
  } else {
    baseReserves = plan.input;
    quoteReserves = 0;
  }
  const pos = planToPosition({
    baseAsset: plan.baseAsset,
    quoteAsset: plan.quoteAsset,
    feeBps: 0,
    price: plan.price,
    baseReserves,
    quoteReserves,
  });
  pos.closeOnFill = true;
  return pos;
};
