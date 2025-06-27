import { scaleLinear } from 'd3-scale';
import { openToast } from '@penumbra-zone/ui/Toast';
import { AssetInfo } from '@/pages/trade/model/AssetInfo';
import { LiquidityDistributionShape, simpleLiquidityPositions } from '@/shared/math/position';
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

  baseInput = '';
  quoteInput = '';
  upperPriceInput: number | null = null;
  lowerPriceInput: number | null = null;
  feeTierPercentInput = String(DEFAULT_FEE_TIER_PERCENT);
  marketPrice: number | null = null;
  positions = DEFAULT_POSITION_COUNT;
  liquidityShape: LiquidityDistributionShape = LiquidityDistributionShape.PYRAMID;

  constructor() {
    makeAutoObservable(this);
  }

  get baseAsset(): undefined | AssetInfo {
    return this._baseAsset;
  }

  get quoteAsset(): undefined | AssetInfo {
    return this._quoteAsset;
  }

  /**
   * Visualization & explanation of the scale and logic:
   * - If the price is lower than the market price, then offer quote
   * - If the price is higher than the market price, then offer base
   * - The scale is used to calculate the amount of opposite asset we want to offer
   *
   * Asset to Offer:         quote       base
   * Scale:           |---|----------|----------|---|
   * Domain (prices):   lower      market     upper
   * Range (amounts):    -10         0          10
   *            (or):     10         0         -10
   */
  updateOppositeInput = () => {
    if (
      this.marketPrice === null ||
      this.lowerPriceInput === null ||
      this.upperPriceInput === null
    ) {
      return;
    }

    if (this.lastTouchedInput === 'quote' && this.quoteInput !== '') {
      const scale = scaleLinear()
        .domain([this.lowerPriceInput, this.marketPrice])
        // eslint-disable-next-line @typescript-eslint/no-unsafe-unary-minus -- explicitly set a negative value to get a positive output
        .range([-this.quoteInput, 0]);

      // extrapolate the value based on the inputs above
      const valueInQuote = scale(this.upperPriceInput);

      // convert the value to the equivalent base asset amount
      this.baseInput = String(Math.max(0, valueInQuote * this.marketPrice));
    } else if (this.lastTouchedInput === 'base' && this.baseInput !== '') {
      const scale = scaleLinear()
        .domain([this.marketPrice, this.upperPriceInput])
        // eslint-disable-next-line @typescript-eslint/no-unsafe-unary-minus -- explicitly set a negative value to get a positive output
        .range([0, -this.baseInput]);

      // extrapolate the value based on the inputs above
      const valueInBase = scale(this.lowerPriceInput);

      // convert the value to the equivalent quote asset amount
      this.quoteInput = String(Math.max(0, valueInBase / this.marketPrice));
    }
  };

  setBaseInput = (x: string) => {
    this.baseInput = String(Math.max(0, Number(x)));
    this.lastTouchedInput = 'base';

    this.updateOppositeInput();
  };

  setQuoteInput = (x: string) => {
    this.quoteInput = String(Math.max(0, Number(x)));
    this.lastTouchedInput = 'quote';

    this.updateOppositeInput();
  };

  get lowerPrice(): number | null {
    return this.lowerPriceInput;
  }

  setLowerPriceInput = (x: number) => {
    this.lowerPriceInput = x;

    if (
      this.lastTouchedInput === 'quote' &&
      this.marketPrice &&
      this.lowerPriceInput > this.marketPrice
    ) {
      if (this.quoteInput !== '') {
        openToast({
          type: 'warning',
          message: `You cannot provide ${this._quoteAsset?.symbol} when the price range is higher than the market price.`,
        });
      }

      this.quoteInput = '';
    }

    this.updateOppositeInput();
  };

  get upperPrice(): number | null {
    return this.upperPriceInput;
  }

  setUpperPriceInput = (x: number) => {
    this.upperPriceInput = x;

    if (
      this.lastTouchedInput === 'base' &&
      this.marketPrice &&
      this.upperPriceInput < this.marketPrice
    ) {
      if (this.baseInput !== '') {
        openToast({
          type: 'warning',
          message: `You cannot provide ${this._baseAsset?.symbol} when the price range is lower than the market price.`,
        });
      }

      this.baseInput = '';
    }

    this.updateOppositeInput();
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
      this.upperPrice === null ||
      this.lowerPrice === null ||
      this.marketPrice === null
    ) {
      return undefined;
    }

    return simpleLiquidityPositions({
      baseAsset: this._baseAsset,
      quoteAsset: this._quoteAsset,
      baseLiquidity: Number(this.baseInput) / this.marketPrice,
      quoteLiquidity: Number(this.quoteInput),
      upperPrice: this.upperPrice,
      lowerPrice: this.lowerPrice,
      marketPrice: this.marketPrice,
      feeBps: this.feeTierPercent * 100,
      positions: this.positions,
      distributionShape: this.liquidityShape,
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
      this.upperPriceInput = null;
      this.lowerPriceInput = null;
      this.baseInput = '';
      this.quoteInput = '';
    }
  }

  setLiquidityShape = (shape: LiquidityDistributionShape) => {
    this.liquidityShape = shape;
  };
}
