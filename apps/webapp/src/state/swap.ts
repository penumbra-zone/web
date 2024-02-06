import { AllSlices, SliceCreator } from './index';
import { Selection } from './types';
import { errorTxToast, loadingTxToast, successTxToast } from '../components/shared/toast-content';
import { toBaseUnit } from '@penumbra-zone/types';
import { toast } from '@penumbra-zone/ui/components/ui/use-toast';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { getAddressByIndex } from '../fetchers/address';
import BigNumber from 'bignumber.js';
import { getTransactionPlan, planWitnessBuildBroadcast } from './helpers';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { getDisplayDenomExponent } from '@penumbra-zone/types/src/denom-metadata';
import {
  Fee,
  FeeTier_Tier,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';

export interface SwapSlice {
  assetIn: Selection | undefined;
  setAssetIn: (selection: Selection) => void;
  amount: string;
  setAmount: (amount: string) => void;
  assetOut: Metadata | undefined;
  setAssetOut: (metadata: Metadata) => void;
  fee: Fee | undefined;
  refreshFee: () => Promise<void>;
  feeTier: FeeTier_Tier;
  setFeeTier: (feeTier: FeeTier_Tier) => void;
  initiateSwapTx: (toastFn: typeof toast) => Promise<void>;
  txInProgress: boolean;
}

export const createSwapSlice = (): SliceCreator<SwapSlice> => (set, get) => {
  return {
    assetIn: undefined,
    setAssetIn: token => {
      set(state => {
        state.swap.assetIn = token;
      });
    },
    assetOut: undefined,
    setAssetOut: denom => {
      set(state => {
        state.swap.assetOut = denom;
      });
    },
    amount: '',
    setAmount: amount => {
      set(state => {
        state.swap.amount = amount;
      });
    },
    txInProgress: false,
    fee: undefined,
    feeTier: FeeTier_Tier.LOW,
    refreshFee: async () => {
      const { amount } = get().swap;

      if (!amount) {
        set(state => {
          state.send.fee = undefined;
        });
        return;
      }

      const txnPlanReq = await assembleRequest(get().swap);
      const plan = await getTransactionPlan(txnPlanReq);
      const fee = plan?.transactionParameters?.fee;
      console.log('swap refreshFee', plan);
      if (!fee?.amount) return;

      set(state => {
        state.send.fee = fee;
      });
    },
    setFeeTier: feeTier => {
      set(state => {
        state.send.feeTier = feeTier;
      });
    },
    initiateSwapTx: async toastFn => {
      set(state => {
        state.swap.txInProgress = true;
      });

      const { dismiss } = toastFn(loadingTxToast);

      try {
        const req = await assembleRequest(get().swap);
        const txHash = await planWitnessBuildBroadcast(req);
        dismiss();
        toastFn(successTxToast(txHash));

        // Reset form
        set(state => {
          state.send.amount = '';
        });
      } catch (e) {
        toastFn(errorTxToast(e));
        throw e;
      } finally {
        set(state => {
          state.send.txInProgress = false;
        });
        dismiss();
      }
    },
  };
};

const assembleRequest = async ({ assetIn, amount, assetOut }: SwapSlice) => {
  if (assetIn?.accountIndex === undefined || !assetIn.asset || !assetOut?.penumbraAssetId)
    throw new Error('missing selected tokens');

  return new TransactionPlannerRequest({
    swaps: [
      {
        targetAsset: assetOut.penumbraAssetId,
        value: {
          amount: toBaseUnit(BigNumber(amount), getDisplayDenomExponent(assetIn.asset.metadata)),
          assetId: assetIn.asset.assetId,
        },
        claimAddress: await getAddressByIndex(assetIn.accountIndex),
        // TODO: Calculate this properly in subsequent PR
        //       Asset Id should almost certainly be upenumbra,
        //       may need to indicate native denom in registry
        // fee: {
        //   amount: toBaseUnit(BigNumber(amount), getDisplayDenomExponent(assetIn.asset.metadata)),
        //   assetId: assetIn.asset.assetId,
        // },
      },
    ],
    source: new AddressIndex({ account: assetIn.accountIndex }),
  });
};

export const swapSelector = (state: AllSlices) => state.swap;
