import { Position } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { PriceLinkedInputs } from './PriceLinkedInputs';
import { limitOrderPosition } from '@/shared/math/position';
import { makeAutoObservable, reaction } from 'mobx';
import { AssetInfo } from '@/pages/trade/model/AssetInfo';
import { parseNumber } from '@/shared/utils/num';

export type Direction = 'buy' | 'sell';

export enum SellLimitOrderOptions {
  Market = 'Market',
  Plus2Percent = '+2%',
  Plus5Percent = '+5%',
  Plus10Percent = '+10%',
  Plus15Percent = '+15%',
}

export enum BuyLimitOrderOptions {
  Market = 'Market',
  Minus2Percent = '-2%',
  Minus5Percent = '-5%',
  Minus10Percent = '-10%',
  Minus15Percent = '-15%',
}

export const BuyLimitOrderMultipliers = {
  [BuyLimitOrderOptions.Market]: 1,
  [BuyLimitOrderOptions.Minus2Percent]: 0.98,
  [BuyLimitOrderOptions.Minus5Percent]: 0.95,
  [BuyLimitOrderOptions.Minus10Percent]: 0.9,
  [BuyLimitOrderOptions.Minus15Percent]: 0.85,
};

export const SellLimitOrderMultipliers = {
  [SellLimitOrderOptions.Market]: 1,
  [SellLimitOrderOptions.Plus2Percent]: 1.02,
  [SellLimitOrderOptions.Plus5Percent]: 1.05,
  [SellLimitOrderOptions.Plus10Percent]: 1.1,
  [SellLimitOrderOptions.Plus15Percent]: 1.15,
};

export class LimitOrderFormStore {
  private _baseAsset?: AssetInfo;
  private _quoteAsset?: AssetInfo;
  private _input = new PriceLinkedInputs();
  direction: Direction = 'buy';
  marketPrice = 1.0;
  private _priceInput = '';
  private _priceInputOption: SellLimitOrderOptions | BuyLimitOrderOptions | undefined;

  constructor() {
    makeAutoObservable(this);

    reaction(() => [this.direction], this._resetInputs);
  }

  private _resetInputs = () => {
    this._input.inputA = '';
    this._input.inputB = '';
    this._priceInput = '';
  };

  setDirection = (x: Direction) => {
    this.direction = x;
  };

  get baseAsset(): undefined | AssetInfo {
    return this._baseAsset;
  }

  get quoteAsset(): undefined | AssetInfo {
    return this._quoteAsset;
  }

  get baseInput(): string {
    return this._input.inputA;
  }

  setBaseInput = (x: string) => {
    this._input.inputA = x;
  };

  get quoteInput(): string {
    return this._input.inputB;
  }

  setQuoteInput = (x: string) => {
    this._input.inputB = x;
  };

  get priceInput(): string {
    return this._priceInput;
  }

  get priceInputOption(): SellLimitOrderOptions | BuyLimitOrderOptions | undefined {
    return this._priceInputOption;
  }

  setPriceInput = (x: string, fromOption = false) => {
    this._priceInput = x;
    const price = this.price;
    if (price !== undefined) {
      this._input.price = price;
    }
    if (!fromOption) {
      this._priceInputOption = undefined;
    }
  };

  setPriceInputOption = (option: SellLimitOrderOptions | BuyLimitOrderOptions) => {
    this._priceInputOption = option;
    const multiplier =
      this.direction === 'buy'
        ? BuyLimitOrderMultipliers[option as BuyLimitOrderOptions]
        : SellLimitOrderMultipliers[option as SellLimitOrderOptions];

    if (!multiplier) {
      return;
    }

    const price = multiplier * this.marketPrice;
    this.setPriceInput(price.toString(), true);
  };

  get price(): number | undefined {
    return parseNumber(this._priceInput);
  }

  get plan(): Position | undefined {
    const input =
      this.direction === 'buy' ? parseNumber(this.quoteInput) : parseNumber(this.baseInput);
    if (!input || !this._baseAsset || !this._quoteAsset || !this.price) {
      return undefined;
    }
    return limitOrderPosition({
      buy: this.direction,
      price: this.price,
      input,
      baseAsset: this._baseAsset,
      quoteAsset: this._quoteAsset,
    });
  }

  get balance(): string {
    if (this.direction === 'buy' && this._quoteAsset?.balance) {
      return this._quoteAsset.formatDisplayAmount(this._quoteAsset.balance);
    }
    if (this.direction === 'sell' && this._baseAsset?.balance) {
      return this._baseAsset.formatDisplayAmount(this._baseAsset.balance);
    }
    return '--';
  }

  setAssets(base: AssetInfo, quote: AssetInfo, resetInputs = false) {
    this._baseAsset = base;
    this._quoteAsset = quote;
    if (resetInputs) {
      this._input.inputA = '';
      this._input.inputB = '';
      this._priceInput = '';
      this._priceInputOption = undefined;
    }
  }
}
