import { AllSlices, SliceCreator } from './index';
import { toast, ToastFnProps } from '@penumbra-zone/ui/components/ui/use-toast';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { authWitnessBuild, broadcast, plan, witnessBuild } from './helpers';
import { buildingTxToast, errorTxToast, successTxToast } from '../components/shared/toast-content';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { AssetBalance } from '../fetchers/balances';
import {
  getAddressIndex,
  getAssetId,
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
  getSwapCommitmentFromTx,
  toBaseUnit,
} from '@penumbra-zone/types';
import BigNumber from 'bignumber.js';
import { getAddressByIndex } from '../fetchers/address';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';

export interface SwapSlice {
  assetIn: AssetBalance | undefined;
  setAssetIn: (asset: AssetBalance) => void;
  amount: string;
  setAmount: (amount: string) => void;
  assetOut: Metadata | undefined;
  setAssetOut: (metadata: Metadata) => void;
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
    initiateSwapTx: async toastFn => {
      set(state => {
        state.swap.txInProgress = true;
      });

      const { update } = toastFn(buildingTxToast());

      try {
        // build swap
        const swapReq = await assembleSwapRequest(get().swap);
        const swapPlan = await plan(swapReq);
        const swapTx = await authWitnessBuild(update, { transactionPlan: swapPlan });

        // begin broadcast
        await broadcast(update, { awaitDetection: true, transaction: swapTx });

        // a swap claim must be broadcast after any successful swap, to claim the output of the swap.
        const swapCommitment = getSwapCommitmentFromTx(swapTx);
        await issueSwapClaim(toastFn, swapCommitment);

        // Reset form
        set(state => {
          state.swap.amount = '';
        });
      } catch (e) {
        toastFn(errorTxToast(e));
        throw e;
      } finally {
        set(state => {
          state.swap.txInProgress = false;
        });
      }
    },
  };
};

const assembleSwapRequest = async ({ assetIn, amount, assetOut }: SwapSlice) => {
  if (!assetIn) throw new Error('`assetIn` was undefined');

  const addressIndex = getAddressIndex(assetIn.address);

  return new TransactionPlannerRequest({
    swaps: [
      {
        targetAsset: getAssetId(assetOut),
        value: {
          amount: toBaseUnit(
            BigNumber(amount),
            getDisplayDenomExponentFromValueView(assetIn.value),
          ),
          assetId: getAssetIdFromValueView(assetIn.value),
        },
        claimAddress: await getAddressByIndex(addressIndex.account),
        // TODO: Calculate this properly in subsequent PR
        //       Asset Id should almost certainly be upenumbra,
        //       may need to indicate native denom in registry
        fee: {
          amount: {
            hi: 0n,
            lo: 0n,
          },
        },
      },
    ],
    source: getAddressIndex(assetIn.address),
  });
};

// Swap claims don't need authenticationData, so `witnessAndBuild` is used.
// This way it won't trigger a second, unnecessary approval popup.
// @see https://protocol.penumbra.zone/main/zswap/swap.html#claiming-swap-outputs
export const issueSwapClaim = async (
  toast: (tp: ToastFnProps) => void,
  swapCommitment: StateCommitment,
) => {
  const swapClaimReq = new TransactionPlannerRequest({ swapClaims: [{ swapCommitment }] });
  const transactionPlan = await plan(swapClaimReq);
  const transaction = await witnessBuild(toast, { transactionPlan });
  const { txHash, detectionHeight } = await broadcast(toast, { transaction, awaitDetection: true });
  toast(successTxToast(txHash, detectionHeight));
};

export const swapSelector = (state: AllSlices) => state.swap;
