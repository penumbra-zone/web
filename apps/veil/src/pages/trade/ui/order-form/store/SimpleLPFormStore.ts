import { AssetInfo } from '@/pages/trade/model/AssetInfo';
import { rangeLiquidityPositions } from '@/shared/math/position';
import { parseNumber } from '@/shared/utils/num';
import { Position } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { pnum } from '@penumbra-zone/types/pnum';
import { makeAutoObservable } from 'mobx';

const extractAmount = (positions: Position[], asset: AssetInfo): number => {
  let out = 0.0;
  for (const position of positions) {
    const asset1 = position.phi?.pair?.asset1;
    const asset2 = position.phi?.pair?.asset2;
    if (asset1?.equals(asset.id)) {
      out += pnum(position.reserves?.r1, asset.exponent).toNumber();
    }
    if (asset2?.equals(asset.id)) {
      out += pnum(position.reserves?.r2, asset.exponent).toNumber();
    }
  }
  return out;
};

const DEFAULT_POSITION_COUNT = 10;
export const DEFAULT_PRICE_SPREAD = 0.05;
export const STABLE_PRICE_SPREAD = 0.01;
export const DEFAULT_PRICE_RANGE = 0.3;
export const STABLE_PRICE_RANGE = 0.1;
const DEFAULT_FEE_TIER_PERCENT = 0.1;

export class SimpleLPFormStore {
  private _baseAsset?: AssetInfo;
  private _quoteAsset?: AssetInfo;
  liquidityTargetInput = '';
  upperPriceInput = '';
  lowerPriceInput = '';
  feeTierPercentInput = String(DEFAULT_FEE_TIER_PERCENT);
  marketPrice = 1;

  constructor() {
    makeAutoObservable(this);
  }

  get baseAsset(): undefined | AssetInfo {
    return this._baseAsset;
  }

  get quoteAsset(): undefined | AssetInfo {
    return this._quoteAsset;
  }

  get liquidityTarget(): number | undefined {
    return parseNumber(this.liquidityTargetInput);
  }

  setLiquidityTargetInput = (x: string) => {
    this.liquidityTargetInput = x;
  };

  get upperPrice(): number | undefined {
    return parseNumber(this.upperPriceInput);
  }

  setUpperPriceInput = (x: string) => {
    this.upperPriceInput = x;
  };

  get lowerPrice(): number | undefined {
    return parseNumber(this.lowerPriceInput);
  }

  setLowerPriceInput = (x: string) => {
    this.lowerPriceInput = x;
  };

  // Treat fees that don't parse as 0
  get feeTierPercent(): number {
    return Math.max(0, Math.min(parseNumber(this.feeTierPercentInput) ?? 0, 50));
  }

  setFeeTierPercentInput = (x: string) => {
    this.feeTierPercentInput = x;
  };

  get plan(): Position[] | undefined {
    if (
      !this._baseAsset ||
      !this._quoteAsset ||
      this.liquidityTarget === undefined ||
      this.upperPrice === undefined ||
      this.lowerPrice === undefined
    ) {
      return undefined;
    }
    return rangeLiquidityPositions({
      baseAsset: this._baseAsset,
      quoteAsset: this._quoteAsset,
      targetLiquidity: this.liquidityTarget,
      upperPrice: this.upperPrice,
      lowerPrice: this.lowerPrice,
      marketPrice: this.marketPrice,
      feeBps: this.feeTierPercent * 100,
      positions: DEFAULT_POSITION_COUNT,
    });
  }

  get baseAssetAmount(): string | undefined {
    const baseAsset = this._baseAsset;
    const plan = this.plan;
    if (!plan || !baseAsset) {
      return undefined;
    }
    return baseAsset.formatDisplayAmount(extractAmount(plan, baseAsset));
  }

  get quoteAssetAmount(): string | undefined {
    const quoteAsset = this._quoteAsset;
    const plan = this.plan;
    if (!plan || !quoteAsset) {
      return undefined;
    }
    return quoteAsset.formatDisplayAmount(extractAmount(plan, quoteAsset));
  }

  setAssets(base: AssetInfo, quote: AssetInfo, resetInputs = false) {
    this._baseAsset = base;
    this._quoteAsset = quote;
    if (resetInputs) {
      this.liquidityTargetInput = '';
      this.upperPriceInput = '';
      this.lowerPriceInput = '';
    }
  }
}
