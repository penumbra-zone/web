import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { AssetId, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { pnum } from '@penumbra-zone/types/pnum';
import debounce from 'lodash/debounce';
import { parseNumber } from '@/shared/utils/num';
import { penumbra } from '@/shared/const/penumbra';
import { SimulationService } from '@penumbra-zone/protobuf';
import { SimulateTradeRequest } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { openToast } from '@penumbra-zone/ui/Toast';
import { AssetInfo } from '@/pages/trade/model/AssetInfo';

const estimateAmount = async (
  from: AssetInfo,
  to: AssetInfo,
  input: number,
): Promise<number | undefined> => {
  try {
    const req = new SimulateTradeRequest({
      input: from.value(input),
      output: to.id,
    });

    const res = await penumbra.service(SimulationService).simulateTrade(req);

    const amount = res.output?.output?.amount;
    if (amount === undefined) {
      throw new Error('Amount returned from swap simulation was undefined');
    }
    return pnum(amount, to.exponent).toNumber();
  } catch (e) {
    if (
      e instanceof Error &&
      ![
        'ConnectError',
        'PenumbraNotInstalledError',
        'PenumbraProviderNotAvailableError',
        'PenumbraProviderNotConnectedError',
      ].includes(e.name)
    ) {
      openToast({
        type: 'error',
        message: e.name,
        description: e.message,
      });
    }
    return undefined;
  }
};

export type Direction = 'buy' | 'sell';

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
      const res = await estimateAmount(this._quoteAsset, this._baseAsset, input);
      if (res === undefined) {
        return;
      }
      runInAction(() => {
        this._quoteAssetInput = res.toString();
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
      const res = await estimateAmount(this._baseAsset, this._quoteAsset, input);
      if (res === undefined) {
        return;
      }
      runInAction(() => {
        this._baseAssetInput = res.toString();
      });
    } finally {
      runInAction(() => {
        this._baseEstimating = false;
      });
    }
  };

  setDirection = (x: Direction) => {
    this.direction = x;
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

  setAssets(base: AssetInfo, quote: AssetInfo, resetInputs = false) {
    this._baseAsset = base;
    this._quoteAsset = quote;
    if (resetInputs) {
      this._baseAssetInput = '';
      this._quoteAssetInput = '';
    }
  }

  get baseAsset(): undefined | AssetInfo {
    return this._baseAsset;
  }

  get quoteAsset(): undefined | AssetInfo {
    return this._quoteAsset;
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
