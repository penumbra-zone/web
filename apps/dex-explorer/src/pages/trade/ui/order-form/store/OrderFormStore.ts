import { useCallback, useEffect } from 'react';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { LimitOrderFormStore } from './LimitOrderFormStore';
import { MarketOrderFormStore } from './MarketOrderFormStore';
import { RangeOrderFormStore } from './RangeOrderFormStore';
import { AssetInfo } from '@/pages/trade/model/AssetInfo';
import {
  BalancesResponse,
  TransactionPlannerRequest,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import {
  Address,
  AddressIndex,
  AddressView,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { usePathToMetadata } from '@/pages/trade/model/use-path';
import { useBalances } from '@/shared/api/balances';
import { connectionStore } from '@/shared/model/connection';
import { useSubaccounts } from '@/widgets/header/api/subaccounts';
import { useMarketPrice } from '@/pages/trade/model/useMarketPrice';
import { getSwapCommitmentFromTx } from '@penumbra-zone/getters/transaction';
import { pnum } from '@penumbra-zone/types/pnum';
import debounce from 'lodash/debounce';
import { useRegistryAssets } from '@/shared/api/registry';
import { plan, planBuildBroadcast } from '../helpers';
import { openToast } from '@penumbra-zone/ui/Toast';
import {
  getMetadataFromBalancesResponse,
  getAmount,
  getAddressIndex,
} from '@penumbra-zone/getters/balances-response';
import { isMetadataEqual } from '@/shared/utils/is-metadata-equal';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export type WhichForm = 'Market' | 'Limit' | 'Range';

export const isWhichForm = (x: string): x is WhichForm => {
  return x === 'Market' || x === 'Limit' || x === 'Range';
};

const GAS_DEBOUNCE_MS = 320;

export class OrderFormStore {
  private _market = new MarketOrderFormStore();
  private _limit = new LimitOrderFormStore();
  private _range = new RangeOrderFormStore();
  private _whichForm: WhichForm = 'Market';
  private _submitting = false;
  private _marketPrice: number | undefined = undefined;
  address?: Address;
  subAccountIndex?: AddressIndex;
  private _umAsset?: AssetInfo;
  private _gasFee: { symbol: string; display: string } = { symbol: 'UM', display: '--' };
  private _gasFeeLoading = false;

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.plan,
      debounce(() => void this.estimateGasFee(), GAS_DEBOUNCE_MS),
    );
  }

  private estimateGasFee = async (): Promise<void> => {
    if (!this.plan || !this._umAsset) {
      return;
    }
    runInAction(() => {
      this._gasFeeLoading = true;
    });
    try {
      const res = await plan(this.plan);
      const fee = res.transactionParameters?.fee;
      if (!fee) {
        return;
      }
      runInAction(() => {
        if (!this._umAsset) {
          return;
        }

        this._gasFee = {
          symbol: this._umAsset.symbol,
          display: pnum(fee.amount, this._umAsset.exponent).toNumber().toString(),
        };
      });
    } catch (e) {
      if (e instanceof Error && e.message.includes('insufficient funds')) {
        openToast({
          type: 'error',
          message: 'Gas fee estimation failed',
          description: 'The amount exceeds your balance',
        });
      }
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
    } finally {
      runInAction(() => {
        this._gasFeeLoading = false;
      });
    }
  };

  setUmAsset = (x: AssetInfo) => {
    this._umAsset = x;
  };

  setSubAccountIndex = (x: AddressIndex) => {
    this.subAccountIndex = x;
  };

  setAddress = (x: Address) => {
    this.address = x;
  };

  get umAsset(): AssetInfo | undefined {
    return this._umAsset;
  }

  get gasFee(): { symbol: string; display: string } {
    return this._gasFee;
  }

  get gasFeeLoading(): boolean {
    return this._gasFeeLoading;
  }

  setAssets(base: AssetInfo, quote: AssetInfo, unsetInputs: boolean) {
    this._market.setAssets(base, quote, unsetInputs);
    this._limit.setAssets(base, quote, unsetInputs);
    this._range.setAssets(base, quote, unsetInputs);
  }

  setMarketPrice(price: number) {
    this._marketPrice = price;
    this._range.marketPrice = price;
    this._limit.marketPrice = price;
  }

  get marketPrice(): number | undefined {
    return this._marketPrice;
  }

  setWhichForm(x: WhichForm) {
    this._whichForm = x;
  }

  get whichForm(): WhichForm {
    return this._whichForm;
  }

  get marketForm() {
    return this._market;
  }

  get limitForm() {
    return this._limit;
  }

  get rangeForm() {
    return this._range;
  }

  get plan(): undefined | TransactionPlannerRequest {
    if (!this.address || !this.subAccountIndex) {
      return undefined;
    }
    if (this._whichForm === 'Market') {
      const plan = this._market.plan;
      if (!plan) {
        return undefined;
      }
      return new TransactionPlannerRequest({
        swaps: [{ targetAsset: plan.targetAsset, value: plan.value, claimAddress: this.address }],
        source: this.subAccountIndex,
      });
    }
    if (this._whichForm === 'Limit') {
      const plan = this._limit.plan;
      if (!plan) {
        return undefined;
      }
      return new TransactionPlannerRequest({
        positionOpens: [{ position: plan }],
        source: this.subAccountIndex,
      });
    }
    const plan = this._range.plan;
    if (plan === undefined) {
      return undefined;
    }
    return new TransactionPlannerRequest({
      positionOpens: plan.map(x => ({ position: x })),
      source: this.subAccountIndex,
    });
  }

  get canSubmit(): boolean {
    return !this._submitting && this.plan !== undefined;
  }

  async submit() {
    const plan = this.plan;
    const wasSwap = this.whichForm === 'Market';
    const source = this.subAccountIndex;
    // Redundant, but makes typescript happier.
    if (!plan || !source) {
      return;
    }

    runInAction(() => {
      this._submitting = true;
    });
    try {
      const tx = await planBuildBroadcast(wasSwap ? 'swap' : 'positionOpen', plan);
      if (!wasSwap || !tx) {
        return;
      }
      const swapCommitment = getSwapCommitmentFromTx(tx);
      const req = new TransactionPlannerRequest({
        swapClaims: [{ swapCommitment }],
        source,
      });
      await planBuildBroadcast('swapClaim', req, { skipAuth: true });
    } finally {
      runInAction(() => {
        this._submitting = false;
      });
    }
  }
}

function getAccountAddress(subAccounts: AddressView[] | undefined) {
  const subAccount = subAccounts ? subAccounts[connectionStore.subaccount] : undefined;
  let addressIndex = undefined;
  let address = undefined;
  const addressView = subAccount?.addressView;
  if (addressView && addressView.case === 'decoded') {
    address = addressView.value.address;
    addressIndex = addressView.value.index;
  }
  return {
    address,
    addressIndex,
  };
}

const orderFormStore = new OrderFormStore();

export const useOrderFormStore = () => {
  const { subaccount } = connectionStore;
  const { data: assets } = useRegistryAssets();
  const { data: subAccounts } = useSubaccounts();
  const { address, addressIndex } = getAccountAddress(subAccounts);
  const { data: balances } = useBalances(addressIndex?.account ?? subaccount);
  const { baseAsset, quoteAsset } = usePathToMetadata();
  const marketPrice = useMarketPrice();

  // Finds a balance by given asset metadata and selected sub-account
  const balanceFinder = useCallback(
    (asset: Metadata, balance: BalancesResponse): boolean => {
      const metadata = getMetadataFromBalancesResponse.optional(balance);
      const address = getAddressIndex.optional(balance);
      if (!metadata || !address || !addressIndex) {
        return false;
      }

      return isMetadataEqual(metadata, asset) && addressIndex.equals(address);
    },
    [addressIndex],
  );

  useEffect(() => {
    if (
      baseAsset?.symbol &&
      baseAsset.penumbraAssetId &&
      quoteAsset?.symbol &&
      quoteAsset.penumbraAssetId
    ) {
      const baseBalance = getAmount.optional(balances?.find(balanceFinder.bind(null, baseAsset)));
      const quoteBalance = getAmount.optional(balances?.find(balanceFinder.bind(null, quoteAsset)));

      const baseAssetInfo = AssetInfo.fromMetadata(baseAsset, baseBalance);
      const quoteAssetInfo = AssetInfo.fromMetadata(quoteAsset, quoteBalance);

      const storeMapping = {
        Market: orderFormStore.marketForm,
        Limit: orderFormStore.limitForm,
        Range: orderFormStore.rangeForm,
      };
      const childStore = storeMapping[orderFormStore.whichForm];
      const prevBaseAssetInfo = childStore.baseAsset;
      const prevQuoteAssetInfo = childStore.quoteAsset;

      const isChangingAssetPair = !!(
        prevBaseAssetInfo?.symbol &&
        prevQuoteAssetInfo?.symbol &&
        (prevBaseAssetInfo.symbol !== baseAssetInfo?.symbol ||
          prevQuoteAssetInfo.symbol !== quoteAssetInfo?.symbol)
      );

      if (baseAssetInfo && quoteAssetInfo) {
        orderFormStore.setAssets(baseAssetInfo, quoteAssetInfo, isChangingAssetPair);
      }
    }
  }, [baseAsset, quoteAsset, balances, balanceFinder]);

  useEffect(() => {
    if (address && addressIndex) {
      orderFormStore.setSubAccountIndex(addressIndex);
      orderFormStore.setAddress(address);
    }
  }, [address, addressIndex]);

  useEffect(() => {
    if (marketPrice) {
      orderFormStore.setMarketPrice(marketPrice);
    }
  }, [marketPrice]);

  useEffect(() => {
    let umAsset: AssetInfo | undefined;
    if (assets) {
      const meta = assets.find(x => x.symbol === 'UM');
      if (meta) {
        umAsset = AssetInfo.fromMetadata(meta);
      }
    }

    if (umAsset && orderFormStore.umAsset?.symbol !== umAsset.symbol) {
      orderFormStore.setUmAsset(umAsset);
    }
  }, [assets]);

  return orderFormStore;
};
