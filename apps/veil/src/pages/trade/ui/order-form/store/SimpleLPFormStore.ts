import { scaleLinear } from 'd3-scale';
import { AssetInfo } from '@/pages/trade/model/AssetInfo';
import { Asset, rangeLiquidityPositions } from '@/shared/math/position';
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
  private lastTouchedInput: 'base' | 'quote' | null = null;

  baseInput: number | null = 0;
  quoteInput: number | null = 0;
  upperPriceInput: number | null = null;
  lowerPriceInput: number | null = null;
  feeTierPercentInput = String(DEFAULT_FEE_TIER_PERCENT);
  marketPrice = 1;
  positions = DEFAULT_POSITION_COUNT;

  constructor() {
    makeAutoObservable(this);
  }

  get baseAsset(): undefined | AssetInfo {
    return this._baseAsset;
  }

  get quoteAsset(): undefined | AssetInfo {
    return this._quoteAsset;
  }

  setBaseInput = (x: string) => {
    this.baseInput = Number(x);
    this.lastTouchedInput = 'base';

    if (this.lowerPriceInput === null || this.upperPriceInput === null) {
      return;
    }

    // Visualization & explanation of the scale and logic:
    // - When the price is lower than the market price, then offer base
    // - When the price is higher than the market price, then offer quote
    // - The scale is used to calculate the amount of opposite asset we want to offer
    // Asset to Offer:         quote       base
    // Scale:           |---|----------|----------|---|
    // Domain (prices):   lower      market     upper
    // Range (amounts):     10         0         -10

    const scale = scaleLinear()
      .domain([this.marketPrice, this.upperPriceInput])
      .range([0, -this.baseInput]);

    const valueInBase = scale(this.lowerPriceInput);
    console.log('TCL: SimpleLPFormStore -> setBaseInput -> valueInBase', valueInBase);
    console.log('TCL: SimpleLPFormStore -> setBaseInput -> this.marketPrice', this.marketPrice);

    this.quoteInput = valueInBase / this.marketPrice;
  };

  setQuoteInput = (x: string) => {
    this.quoteInput = Number(x);

    this.lastTouchedInput = 'quote';

    if (this.lowerPriceInput === null || this.upperPriceInput === null) {
      return;
    }

    // Visualization & explanation of the scale and logic:
    // - When the price is lower than the market price, then offer base
    // - When the price is higher than the market price, then offer quote
    // - The scale is used to calculate the amount of opposite asset we want to offer
    // Asset to Offer:         quote       base
    // Scale:           |---|----------|----------|---|
    // Domain (prices):   lower      market     upper
    // Range (amounts):    -10         0          10

    const scale = scaleLinear()
      .domain([this.lowerPriceInput, this.marketPrice])
      .range([-this.quoteInput, 0]);

    const valueInQuote = scale(this.upperPriceInput);

    this.baseInput = valueInQuote * this.marketPrice;
  };

  get lowerPrice(): number | undefined {
    return this.lowerPriceInput;
  }

  setLowerPriceInput = (x: number) => {
    this.lowerPriceInput = x;
  };

  get upperPrice(): number | undefined {
    return this.upperPriceInput;
  }

  setUpperPriceInput = (x: number) => {
    this.upperPriceInput = x;
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
      this.quoteInput === '' ||
      this.baseInput === '' ||
      this.upperPrice === undefined ||
      this.lowerPrice === undefined
    ) {
      return undefined;
    }
    return rangeLiquidityPositions({
      baseAsset: this._baseAsset,
      quoteAsset: this._quoteAsset,
      targetLiquidity: Number(this.quoteInput) + Number(this.baseInput),
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
