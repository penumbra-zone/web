import { makeAutoObservable } from 'mobx';
import { BigNumber } from 'bignumber.js';
import { round } from 'lodash';
import debounce from 'lodash/debounce';
import { SimulationService } from '@penumbra-zone/protobuf';
import {
  BalancesResponse,
  TransactionPlannerRequest,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import {
  AssetId,
  Metadata,
  Value,
  ValueView,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { SimulateTradeRequest } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { getAssetId, getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { getSwapCommitmentFromTx } from '@penumbra-zone/getters/transaction';
import { getAddressIndex, getAddress } from '@penumbra-zone/getters/address-view';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { LoHi, toBaseUnit } from '@penumbra-zone/types/lo-hi';
import {
  AddressView,
  Address,
  AddressIndex,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { penumbra } from '@/shared/const/penumbra';
import { plan, planBuildBroadcast } from './helpers';
import { openToast } from '@penumbra-zone/ui/Toast';

export enum Direction {
  Buy = 'Buy',
  Sell = 'Sell',
}

export enum OrderType {
  Swap = 'Swap',
  Auction = 'Auction',
}

export class OrderFormAsset {
  symbol: string;
  metadata?: Metadata;
  exponent?: number;
  assetId?: AssetId;
  balanceView?: ValueView;
  accountAddress?: Address;
  accountIndex?: AddressIndex;
  balance?: number;
  amount?: number;
  onAmountChangeCallback?: (asset: OrderFormAsset) => Promise<void>;
  isEstimating = false;
  isApproximately = false;

  constructor(metadata?: Metadata) {
    makeAutoObservable(this);

    this.metadata = metadata;
    this.symbol = metadata?.symbol ?? '';
    this.assetId = metadata ? getAssetId(metadata) : undefined;
    this.exponent = metadata ? getDisplayDenomExponent(metadata) : undefined;
  }

  setBalanceView = (balanceView: ValueView): void => {
    this.balanceView = balanceView;
    this.setBalanceFromBalanceView(balanceView);
  };

  setAccountAddress = (addressView: AddressView): void => {
    this.accountAddress = getAddress(addressView);
    this.accountIndex = getAddressIndex(addressView);
  };

  setBalanceFromBalanceView = (balanceView: ValueView): void => {
    const balance = getFormattedAmtFromValueView(balanceView, true);
    this.balance = parseFloat(balance.replace(/,/g, ''));
  };

  setAmount = (amount: string | number, callOnAmountChange = true): void => {
    const prevAmount = this.amount;
    const nextAmount = round(Number(amount), this.exponent);

    if (prevAmount !== nextAmount) {
      this.amount = nextAmount;

      if (this.onAmountChangeCallback && callOnAmountChange) {
        void this.onAmountChangeCallback(this);
      }
    }
  };

  unsetAmount = (): void => {
    this.amount = undefined;
    this.isApproximately = false;
    this.isEstimating = false;
  };

  setIsEstimating = (isEstimating: boolean): void => {
    this.isEstimating = isEstimating;
  };

  setIsApproximately = (isApproximately: boolean): void => {
    this.isApproximately = isApproximately;
  };

  onAmountChange = (callback: (asset: OrderFormAsset) => Promise<void>): void => {
    this.onAmountChangeCallback = callback;
  };

  toAmount = (): LoHi => {
    return toBaseUnit(BigNumber(this.amount ?? 0), this.exponent);
  };

  toValue = (): Value => {
    return new Value({
      assetId: this.assetId,
      amount: this.toAmount(),
    });
  };
}

class OrderFormStore {
  type: OrderType = OrderType.Swap;
  direction: Direction = Direction.Buy;
  baseAsset = new OrderFormAsset();
  quoteAsset = new OrderFormAsset();
  balances: BalancesResponse[] | undefined;
  exchangeRate: number | null = null;
  gasFee: number | null = null;
  isLoading = false;

  constructor() {
    makeAutoObservable(this);

    void this.calculateGasFee();
    void this.calculateExchangeRate();
  }

  setType = (type: OrderType): void => {
    this.type = type;
  };

  setDirection = (direction: Direction): void => {
    this.direction = direction;
  };

  private setBalancesOfAssets = (): void => {
    const baseAssetBalance = this.balances?.find(resp =>
      getAssetIdFromValueView(resp.balanceView).equals(getAssetId(this.baseAsset.metadata)),
    );
    if (baseAssetBalance?.balanceView) {
      this.baseAsset.setBalanceView(baseAssetBalance.balanceView);
    }
    if (baseAssetBalance?.accountAddress) {
      this.baseAsset.setAccountAddress(baseAssetBalance.accountAddress);
    }

    const quoteAssetBalance = this.balances?.find(resp =>
      getAssetIdFromValueView(resp.balanceView).equals(getAssetId(this.quoteAsset.metadata)),
    );
    if (quoteAssetBalance?.balanceView) {
      this.quoteAsset.setBalanceView(quoteAssetBalance.balanceView);
    }
    if (quoteAssetBalance?.accountAddress) {
      this.quoteAsset.setAccountAddress(quoteAssetBalance.accountAddress);
    }
  };

  private simulateSwapTx = async (
    assetIn: OrderFormAsset,
    assetOut: OrderFormAsset,
  ): Promise<ValueView | void> => {
    try {
      const req = new SimulateTradeRequest({
        input: assetIn.toValue(),
        output: assetOut.assetId,
      });

      const res = await penumbra.service(SimulationService).simulateTrade(req);

      const output = new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: res.output?.output?.amount,
            metadata: assetOut.metadata,
          },
        },
      });

      return output;
    } catch (e) {
      if (e instanceof Error && e.name !== 'PenumbraProviderNotAvailableError') {
        openToast({
          type: 'error',
          message: e.name,
          description: e.message,
        });
      }
    }
  };

  setAssets = (baseAsset: Metadata, quoteAsset: Metadata): void => {
    this.baseAsset = new OrderFormAsset(baseAsset);
    this.quoteAsset = new OrderFormAsset(quoteAsset);

    const debouncedHandleAmountChange = debounce(this.handleAmountChange, 500);

    this.baseAsset.onAmountChange(
      debouncedHandleAmountChange as (asset: OrderFormAsset) => Promise<void>,
    );
    this.quoteAsset.onAmountChange(
      debouncedHandleAmountChange as (asset: OrderFormAsset) => Promise<void>,
    );

    this.setBalancesOfAssets();
    void this.calculateGasFee();
    void this.calculateExchangeRate();
  };

  setBalances = (balances: BalancesResponse[]): void => {
    this.balances = balances;
    this.setBalancesOfAssets();
  };

  handleAmountChange = async (asset: OrderFormAsset): Promise<void> => {
    const assetIsBaseAsset = asset.assetId === this.baseAsset.assetId;
    const assetIn = assetIsBaseAsset ? this.baseAsset : this.quoteAsset;
    const assetOut = assetIsBaseAsset ? this.quoteAsset : this.baseAsset;

    try {
      void this.calculateGasFee();

      assetOut.setIsEstimating(true);

      // reset potentially previously set flag
      assetIn.setIsApproximately(false);

      const output = await this.simulateSwapTx(assetIn, assetOut);
      if (!output) {
        return;
      }

      const outputAmount = getFormattedAmtFromValueView(output, true);

      assetOut.setAmount(Number(outputAmount), false);
      assetOut.setIsApproximately(true);
    } finally {
      assetOut.setIsEstimating(false);
    }
  };

  calculateExchangeRate = async (): Promise<void> => {
    this.exchangeRate = null;

    const baseAsset: OrderFormAsset = new OrderFormAsset(this.baseAsset.metadata);
    baseAsset.setAmount(1);

    const output = await this.simulateSwapTx(baseAsset, this.quoteAsset);
    if (!output) {
      return;
    }

    const outputAmount = getFormattedAmtFromValueView(output, true);
    this.exchangeRate = Number(outputAmount);
  };

  calculateGasFee = async (): Promise<void> => {
    this.gasFee = null;

    const isBuy = this.direction === Direction.Buy;
    const assetIn = isBuy ? this.quoteAsset : this.baseAsset;
    const assetOut = isBuy ? this.baseAsset : this.quoteAsset;

    if (!assetIn.amount || !assetOut.amount) {
      this.gasFee = 0;
      return;
    }

    const req = new TransactionPlannerRequest({
      swaps: [
        {
          targetAsset: assetOut.assetId,
          value: {
            amount: assetIn.toAmount(),
            assetId: assetIn.assetId,
          },
          claimAddress: assetIn.accountAddress,
        },
      ],
      source: assetIn.accountIndex,
    });

    const txPlan = await plan(req);
    const fee = txPlan.transactionParameters?.fee;
    const feeValueView = new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: fee?.amount ?? { hi: 0n, lo: 0n },
          metadata: this.baseAsset.metadata,
        },
      },
    });

    const feeAmount = getFormattedAmtFromValueView(feeValueView, true);
    this.gasFee = Number(feeAmount);
  };

  initiateSwapTx = async (): Promise<void> => {
    try {
      this.isLoading = true;

      const isBuy = this.direction === Direction.Buy;
      const assetIn = isBuy ? this.quoteAsset : this.baseAsset;
      const assetOut = isBuy ? this.baseAsset : this.quoteAsset;

      if (!assetIn.amount || !assetOut.amount) {
        openToast({
          type: 'error',
          message: 'Please enter an amount.',
        });
        return;
      }

      const swapReq = new TransactionPlannerRequest({
        swaps: [
          {
            targetAsset: assetOut.assetId,
            value: {
              amount: assetIn.toAmount(),
              assetId: assetIn.assetId,
            },
            claimAddress: assetIn.accountAddress,
          },
        ],
        source: assetIn.accountIndex,
      });

      const swapTx = await planBuildBroadcast('swap', swapReq);
      const swapCommitment = getSwapCommitmentFromTx(swapTx);

      // Issue swap claim
      const req = new TransactionPlannerRequest({
        swapClaims: [{ swapCommitment }],
        source: assetIn.accountIndex,
      });
      await planBuildBroadcast('swapClaim', req, { skipAuth: true });

      assetIn.unsetAmount();
      assetOut.unsetAmount();
    } catch (e) {
      openToast({
        type: 'error',
        message: 'Error submitting order',
        description: JSON.stringify(e),
      });
    } finally {
      this.isLoading = false;
    }
  };

  submitOrder = (): void => {
    if (this.type === OrderType.Swap) {
      void this.initiateSwapTx();
    }

    if (this.type === OrderType.Auction) {
      // @TODO: handle other order types
    }
  };
}

export const orderFormStore = new OrderFormStore();
