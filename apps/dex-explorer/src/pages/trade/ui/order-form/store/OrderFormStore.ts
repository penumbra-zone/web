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
import { useStakingTokenMetadata } from '@/shared/api/registry';
import { planTransaction, planBuildBroadcast } from '@/entities/transaction';
import { openToast } from '@penumbra-zone/ui/Toast';
import {
  getMetadataFromBalancesResponse,
  getAmount,
  getAddressIndex,
} from '@penumbra-zone/getters/balances-response';
import { isMetadataEqual } from '@/shared/utils/is-metadata-equal';
import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getAssetMetadataById } from '@/shared/api/metadata';
import { updatePositionsQuery } from '@/entities/position';

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
  private _feeAsset?: AssetInfo;
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
    if (!this.plan) {
      this.resetGasFee();
      return;
    }

    runInAction(() => {
      this._gasFeeLoading = true;
    });
    try {
      const res = await planTransaction(this.plan);
      const fee = res.transactionParameters?.fee;
      if (!fee) {
        this.resetGasFee();
        return;
      }
      await runInAction(async () => {
        // If the fee asset is the staking token, do nothing since it’s already handled in the useEffect
        // below. Otherwise, set the fee to an alternative asset.
        const feeAssetId = res.transactionParameters?.fee?.assetId;
        if (feeAssetId) {
          await this.setAlternativeFee(feeAssetId);
        }

        if (!this._feeAsset) {
          return;
        }

        this._gasFee = {
          symbol: this._feeAsset.symbol,
          display: pnum(fee.amount, this._feeAsset.exponent).toNumber().toString(),
        };
      });
    } catch (e) {
      return undefined;
    } finally {
      runInAction(() => {
        this._gasFeeLoading = false;
      });
    }
  };

  resetGasFee() {
    runInAction(() => {
      this._gasFee = { symbol: 'UM', display: '--' };
      this._gasFeeLoading = false;
    });
  }

  setFeeAsset = (x: AssetInfo) => {
    this._feeAsset = x;
  };

  setSubAccountIndex = (x: AddressIndex) => {
    this.subAccountIndex = x;
  };

  setAddress = (x: Address) => {
    this.address = x;
  };

  get feeAsset(): AssetInfo | undefined {
    return this._feeAsset;
  }

  get gasFee(): { symbol: string; display: string } {
    return this._gasFee;
  }

  get gasFeeLoading(): boolean {
    return this._gasFeeLoading;
  }

  async setAlternativeFee(feeAssetId: AssetId) {
    const metadata = await getAssetMetadataById(feeAssetId);
    if (!metadata) {
      return;
    }

    const assetInfo = AssetInfo.fromMetadata(metadata);
    if (!assetInfo) {
      return;
    }

    // Update the order form store so that it uses this asset as the fee asset
    orderFormStore.setFeeAsset(assetInfo);
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
        this.resetGasFee();
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
        this.resetGasFee();
        return undefined;
      }
      return new TransactionPlannerRequest({
        positionOpens: [{ position: plan }],
        source: this.subAccountIndex,
      });
    }
    const plan = this._range.plan;
    if (!plan) {
      this.resetGasFee();
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
      this.resetGasFee();
      return;
    }

    runInAction(() => {
      this._submitting = true;
    });
    try {
      const tx = await planBuildBroadcast(wasSwap ? 'swap' : 'positionOpen', plan);
      await updatePositionsQuery();

      if (!wasSwap || !tx) {
        return;
      }
      const swapCommitment = getSwapCommitmentFromTx(tx);
      const req = new TransactionPlannerRequest({
        swapClaims: [{ swapCommitment }],
        source,
      });
      await planBuildBroadcast('swapClaim', req, { skipAuth: true });
      await updatePositionsQuery();
    } catch (e) {
      if (e instanceof Error && e.message.includes('insufficient funds')) {
        openToast({
          type: 'error',
          message: 'Transaction failed',
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
      throw e;
    } finally {
      runInAction(() => {
        this._submitting = false;
      });
    }
  }
}

/**
 * Finds the subaccount in subAccounts where the address index matches `connectionStore.subaccount`, properly
 * handling non-1:1 mappings by iterating through address views.
 */
const findMatchingSubaccount = (subaccounts: AddressView[] | undefined, targetAccount: number) => {
  if (!subaccounts) {
    return undefined;
  }

  return subaccounts.find(subaccount => {
    const addressView = subaccount.addressView;
    if (addressView.case === 'decoded') {
      return addressView.value.index?.account === targetAccount;
    } else {
      return undefined;
    }
  });
};

function getAccountAddress(subAccounts: AddressView[] | undefined) {
  const matchedSubaccount = findMatchingSubaccount(subAccounts, connectionStore.subaccount);
  const subAccount = subAccounts ? matchedSubaccount : undefined;
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
  const { data: registryUM } = useStakingTokenMetadata();
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

      let umAsset: AssetInfo | undefined;
      if (registryUM) {
        umAsset = AssetInfo.fromMetadata(registryUM);
      }

      if (umAsset && orderFormStore.feeAsset?.symbol !== umAsset.symbol) {
        orderFormStore.setFeeAsset(umAsset);
        orderFormStore.resetGasFee();
      }
    }
  }, [address, addressIndex, registryUM]);

  useEffect(() => {
    if (marketPrice) {
      orderFormStore.setMarketPrice(marketPrice);
    }
  }, [marketPrice]);

  return orderFormStore;
};
