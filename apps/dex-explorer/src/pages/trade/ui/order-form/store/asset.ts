import { makeAutoObservable } from 'mobx';
import { BigNumber } from 'bignumber.js';
import { round } from 'lodash';
import {
  AssetId,
  Metadata,
  Value,
  ValueView,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getAssetId, getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { getAddressIndex, getAddress } from '@penumbra-zone/getters/address-view';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { joinLoHi, LoHi, toBaseUnit } from '@penumbra-zone/types/lo-hi';
import {
  AddressView,
  Address,
  AddressIndex,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

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
    this.isEstimating = false;
  };

  setIsEstimating = (isEstimating: boolean): void => {
    this.isEstimating = isEstimating;
  };

  onAmountChange = (callback: (asset: OrderFormAsset) => Promise<void>): void => {
    this.onAmountChangeCallback = callback;
  };

  toAmount = (): LoHi => {
    return toBaseUnit(BigNumber(this.amount ?? 0), this.exponent);
  };

  toUnitAmount = (): bigint => {
    const amount = this.toAmount();
    return joinLoHi(amount.lo, amount.hi);
  };

  toValue = (): Value => {
    return new Value({
      assetId: this.assetId,
      amount: this.toAmount(),
    });
  };
}
