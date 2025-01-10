import debounce from 'lodash/debounce';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { AssetId, Value, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { pnum } from '@penumbra-zone/types/pnum';
import { parseNumber } from '@/shared/utils/num';
import { AssetInfo } from '../../../model/AssetInfo';
import { estimateAmount } from './estimate-amount';
import { formatNumber } from '@penumbra-zone/types/amount';
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { Direction } from './types';

export type LastEdited = 'Base' | 'Quote';

// When we need to use an estimate call, avoid triggering it for this many milliseconds
// to avoid jitter as the user types.
const ESTIMATE_DEBOUNCE_MS = 160;

export interface MarketOrderPlan {
  targetAsset: AssetId;
  value: Value;
}

export class MarketOrderFormStore {
  private _baseAsset?: AssetInfo;
  private _quoteAsset?: AssetInfo;
  private _baseAssetInput = '';
  private _quoteAssetInput = '';
  private _baseEstimating = false;
  private _quoteEstimating = false;
  private _priceImpact: number | undefined = undefined;
  private _unfilled: ValueView | undefined = undefined;
  direction: Direction = 'buy';
  private _lastEdited: LastEdited = 'Base';

  constructor() {
    makeAutoObservable(this);

    // Two reactions to avoid a double trigger.
    reaction(
      () => [this._lastEdited, this._baseAssetInput, this._baseAsset, this._quoteAsset],
      debounce(() => {
        void this.estimateQuote();
      }, ESTIMATE_DEBOUNCE_MS),
    );
    reaction(
      () => [this._lastEdited, this._quoteAssetInput, this._baseAsset, this._quoteAsset],
      debounce(() => {
        void this.estimateBase();
      }, ESTIMATE_DEBOUNCE_MS),
    );
  }

  private estimateQuote = async (): Promise<void> => {
    if (!this._baseAsset || !this._quoteAsset || this._lastEdited !== 'Base') {
      return;
    }
    const input = this.baseInputAmount;
    if (input === undefined) {
      return;
    }
    runInAction(() => {
      this._quoteEstimating = true;
    });
    try {
      const res = await estimateAmount(this._baseAsset, this._quoteAsset, input, this.direction);
      if (res === undefined) {
        return;
      }
      runInAction(() => {
        this._quoteAssetInput = res.amount.toString();
        this._priceImpact = res.priceImpact;
        this._unfilled = res.unfilled;
      });
    } finally {
      runInAction(() => {
        this._quoteEstimating = false;
      });
    }
  };

  private estimateBase = async (): Promise<void> => {
    if (!this._baseAsset || !this._quoteAsset || this._lastEdited !== 'Quote') {
      return;
    }
    const input = this.quoteInputAmount;
    if (input === undefined) {
      return;
    }
    runInAction(() => {
      this._baseEstimating = true;
    });
    try {
      const res = await estimateAmount(this._quoteAsset, this._baseAsset, input, this.direction);
      if (res === undefined) {
        return;
      }
      runInAction(() => {
        this._baseAssetInput = res.amount.toString();
        this._priceImpact = res.priceImpact;
        this._unfilled = res.unfilled;
      });
    } finally {
      runInAction(() => {
        this._baseEstimating = false;
      });
    }
  };

  setDirection = (x: Direction) => {
    this.direction = x;
    this._unfilled = undefined;
    this._priceImpact = undefined;
    void this.estimateQuote();
  };

  get baseInput(): string {
    return this._baseAssetInput;
  }

  setBaseInput = (x: string) => {
    this._lastEdited = 'Base';
    this._baseAssetInput = x;
  };

  get quoteInput(): string {
    return this._quoteAssetInput;
  }

  setQuoteInput = (x: string) => {
    this._lastEdited = 'Quote';
    this._quoteAssetInput = x;
  };

  get baseInputAmount(): undefined | number {
    return parseNumber(this._baseAssetInput);
  }

  get quoteInputAmount(): undefined | number {
    return parseNumber(this._quoteAssetInput);
  }

  get baseEstimating(): boolean {
    return this._baseEstimating;
  }

  get quoteEstimating(): boolean {
    return this._quoteEstimating;
  }

  get balance(): undefined | string {
    if (this.direction === 'buy') {
      if (!this._quoteAsset?.balance) {
        return undefined;
      }
      return this._quoteAsset.formatDisplayAmount(this._quoteAsset.balance);
    }
    if (!this._baseAsset?.balance) {
      return undefined;
    }
    return this._baseAsset.formatDisplayAmount(this._baseAsset.balance);
  }

  get quoteBalance(): undefined | number {
    if (!this._quoteAsset?.balance) {
      return undefined;
    }
    return pnum(this._quoteAsset.balance, this._quoteAsset.exponent).toNumber();
  }

  setBalanceFraction(x: number) {
    const clamped = Math.max(0.0, Math.min(1.0, x));
    if (this.direction === 'buy' && this._quoteAsset?.balance) {
      this.setQuoteInput((clamped * this._quoteAsset.balance).toString());
    }
    if (this.direction === 'sell' && this._baseAsset?.balance) {
      this.setBaseInput((clamped * this._baseAsset.balance).toString());
    }
  }

  get lastEdited(): LastEdited {
    return this._lastEdited;
  }

  clear() {
    this._baseAssetInput = '';
    this._quoteAssetInput = '';
    this._unfilled = undefined;
    this._priceImpact = undefined;
  }

  setAssets(base: AssetInfo, quote: AssetInfo, resetInputs = false) {
    this._baseAsset = base;
    this._quoteAsset = quote;
    if (resetInputs) {
      this.clear();
    }
  }

  get baseAsset(): undefined | AssetInfo {
    return this._baseAsset;
  }

  get quoteAsset(): undefined | AssetInfo {
    return this._quoteAsset;
  }

  get unfilled(): undefined | string {
    if (!this._unfilled) {
      return undefined;
    }
    const symbol = getMetadata(this._unfilled).symbol;
    return `${pnum(this._unfilled).toNumber()} ${symbol}`;
  }

  get priceImpact(): undefined | string {
    if (this._priceImpact === undefined || Math.abs(this._priceImpact) < 0.001) {
      return;
    }
    const percent = formatNumber(this._priceImpact * 100, { precision: 3 });
    return `${percent}%`;
  }

  get plan(): undefined | MarketOrderPlan {
    if (!this._baseAsset || !this._quoteAsset) {
      return;
    }
    const { inputAsset, inputAmount, output } =
      this.direction === 'buy'
        ? {
            inputAsset: this._quoteAsset,
            inputAmount: this.quoteInputAmount,
            output: this._baseAsset,
          }
        : {
            inputAsset: this._baseAsset,
            inputAmount: this.baseInputAmount,
            output: this._quoteAsset,
          };
    if (inputAmount === undefined) {
      return;
    }
    return {
      targetAsset: output.id,
      value: inputAsset.value(inputAmount),
    };
  }
}
