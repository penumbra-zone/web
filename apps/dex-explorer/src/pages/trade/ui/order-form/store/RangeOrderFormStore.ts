import { AssetInfo } from '@/pages/trade/model/AssetInfo';
import { rangeLiquidityPositions } from '@/shared/math/position';
import { parseNumber } from '@/shared/utils/num';
import { Position } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { pnum } from '@penumbra-zone/types/pnum';
import { makeAutoObservable } from 'mobx';

export enum UpperBoundOptions {
  Market = 'Market',
  Plus2Percent = '+2%',
  Plus5Percent = '+5%',
  Plus10Percent = '+10%',
  Plus15Percent = '+15%',
}

export enum LowerBoundOptions {
  Market = 'Market',
  Minus2Percent = '-2%',
  Minus5Percent = '-5%',
  Minus10Percent = '-10%',
  Minus15Percent = '-15%',
}

export enum FeeTierOptions {
  '0.1%' = '0.1%',
  '0.25%' = '0.25%',
  '0.5%' = '0.5%',
  '1.00%' = '1.00%',
}

const UpperBoundMultipliers = {
  [UpperBoundOptions.Market]: 1,
  [UpperBoundOptions.Plus2Percent]: 1.02,
  [UpperBoundOptions.Plus5Percent]: 1.05,
  [UpperBoundOptions.Plus10Percent]: 1.1,
  [UpperBoundOptions.Plus15Percent]: 1.15,
};

const LowerBoundMultipliers = {
  [LowerBoundOptions.Market]: 1,
  [LowerBoundOptions.Minus2Percent]: 0.98,
  [LowerBoundOptions.Minus5Percent]: 0.95,
  [LowerBoundOptions.Minus10Percent]: 0.9,
  [LowerBoundOptions.Minus15Percent]: 0.85,
};

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

export const MIN_POSITION_COUNT = 5;
export const MAX_POSITION_COUNT = 15;

export class RangeOrderFormStore {
  private _baseAsset?: AssetInfo;
  private _quoteAsset?: AssetInfo;
  liquidityTargetInput = '';
  upperPriceInput = '';
  lowerPriceInput = '';
  upperPriceInputOption: UpperBoundOptions | undefined;
  lowerPriceInputOption: LowerBoundOptions | undefined;
  feeTierPercentInput = '';
  feeTierPercentInputOption: FeeTierOptions | undefined;
  private _positionCountInput = '10';
  private _positionCountSlider = 10;
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

  setUpperPriceInput = (x: string, fromOption = false) => {
    this.upperPriceInput = x;
    if (!fromOption) {
      this.upperPriceInputOption = undefined;
    }
  };

  setUpperPriceInputOption = (option: UpperBoundOptions) => {
    this.upperPriceInputOption = option;
    const multiplier = UpperBoundMultipliers[option];

    if (!multiplier) {
      return;
    }

    const price = multiplier * this.marketPrice;
    this.setUpperPriceInput(price.toString(), true);
  };

  get lowerPrice(): number | undefined {
    return parseNumber(this.lowerPriceInput);
  }

  setLowerPriceInput = (x: string, fromOption = false) => {
    this.lowerPriceInput = x;
    if (!fromOption) {
      this.lowerPriceInputOption = undefined;
    }
  };

  setLowerPriceInputOption = (option: LowerBoundOptions) => {
    this.lowerPriceInputOption = option;
    const multiplier = LowerBoundMultipliers[option];

    if (!multiplier) {
      return;
    }

    const price = multiplier * this.marketPrice;
    this.setLowerPriceInput(price.toString(), true);
  };

  // Treat fees that don't parse as 0
  get feeTierPercent(): number {
    return Math.max(0, Math.min(parseNumber(this.feeTierPercentInput) ?? 0, 50));
  }

  setFeeTierPercentInput = (x: string, fromOption = false) => {
    this.feeTierPercentInput = x;
    if (!fromOption) {
      this.feeTierPercentInputOption = undefined;
    }
  };

  setFeeTierPercentInputOption = (option: FeeTierOptions) => {
    this.feeTierPercentInputOption = option;
    this.setFeeTierPercentInput(option.replace('%', ''), true);
  };

  get positionCountInput(): string {
    return this._positionCountInput;
  }

  setPositionCountInput = (x: string) => {
    this._positionCountInput = x;
    const count = this.positionCount;
    if (count !== undefined) {
      this._positionCountSlider = Math.max(MIN_POSITION_COUNT, Math.min(count, MAX_POSITION_COUNT));
    }
  };

  get positionCountSlider(): number {
    return this._positionCountSlider;
  }

  setPositionCountSlider = (x: number) => {
    this._positionCountSlider = x;
    this._positionCountInput = x.toString();
  };

  get positionCount(): undefined | number {
    return parseNumber(this._positionCountInput);
  }

  get plan(): Position[] | undefined {
    if (
      !this._baseAsset ||
      !this._quoteAsset ||
      this.liquidityTarget === undefined ||
      this.upperPrice === undefined ||
      this.lowerPrice === undefined ||
      this.positionCount === undefined
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
      positions: this.positionCount,
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
      this.upperPriceInputOption = undefined;
      this.lowerPriceInput = '';
      this.lowerPriceInputOption = undefined;
      this.feeTierPercentInput = '';
      this._positionCountInput = '10';
      this._positionCountSlider = 10;
    }
  }
}
