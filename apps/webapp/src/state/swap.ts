import { AllSlices, SliceCreator } from './index';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { authWitnessBuild, broadcast, getTxHash, plan, witnessBuild } from './helpers';
import {
  broadcastingTxToast,
  buildingTxToast,
  errorTxToast,
  successTxToast,
} from '../components/shared/toast-content';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
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
import { simulateSwapOutput } from '../fetchers/simulate.ts';

export interface SwapSlice {
  assetIn: AssetBalance | undefined;
  setAssetIn: (asset: AssetBalance) => void;
  amount: string;
  setAmount: (amount: string) => void;
  assetOut: Metadata | undefined;
  setAssetOut: (metadata: Metadata) => void;
  initiateSwapTx: () => Promise<void>;
  txInProgress: boolean;
  simulateSwap: () => Promise<void>;
  simulateOutResult: ValueView | undefined;
}

export const createSwapSlice = (): SliceCreator<SwapSlice> => (set, get) => {
  return {
    assetIn: undefined,
    setAssetIn: asset => {
      set(({ swap }) => {
        swap.assetIn = asset;
        swap.simulateOutResult = undefined;
      });
    },
    assetOut: undefined,
    setAssetOut: metadata => {
      set(({ swap }) => {
        swap.assetOut = metadata;
        swap.simulateOutResult = undefined;
      });
    },
    amount: '',
    setAmount: amount => {
      set(({ swap }) => {
        swap.amount = amount;
        swap.simulateOutResult = undefined;
      });
    },
    txInProgress: false,
    simulateOutResult: undefined,
    simulateSwap: async () => {
      try {
        const assetIn = get().swap.assetIn;
        const assetOut = get().swap.assetOut;
        if (!assetIn || !assetOut) throw new Error('Both asset in and out need to be set');

        const outputVal = await simulateSwapOutput(assetIn.value, assetOut);
        set(({ swap }) => {
          swap.simulateOutResult = outputVal;
        });
      } catch (e) {
        errorTxToast(e);
      }
    },
    initiateSwapTx: async () => {
      set(state => {
        state.swap.txInProgress = true;
      });

      const swapToastId = buildingTxToast(undefined, undefined, 'Building swap transaction');

      try {
        // build swap
        const swapReq = await assembleSwapRequest(get().swap);
        const swapPlan = await plan(swapReq);
        const swapTx = await authWitnessBuild({ transactionPlan: swapPlan }, status =>
          buildingTxToast(status, swapToastId, 'Building swap transaction'),
        );
        const swapTxHash = await getTxHash(swapTx);
        await broadcast({ awaitDetection: true, transaction: swapTx }, status =>
          broadcastingTxToast(swapTxHash, status, swapToastId),
        );
        successTxToast(swapTxHash, undefined, swapToastId, 'Swap transaction succeeded! 🎉');

        // a swap claim must be broadcast after any successful swap, to claim the output of the swap.
        const swapCommitment = getSwapCommitmentFromTx(swapTx);
        await issueSwapClaim(swapCommitment);

        // Reset form
        set(state => {
          state.swap.amount = '';
        });
      } catch (e) {
        errorTxToast(e, swapToastId);
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
  swapCommitment: StateCommitment,
  existingToastId?: string | number,
) => {
  const toastId = buildingTxToast(undefined, existingToastId, 'Building swap claim transaction');
  const swapClaimReq = new TransactionPlannerRequest({ swapClaims: [{ swapCommitment }] });
  const transactionPlan = await plan(swapClaimReq);
  const transaction = await witnessBuild({ transactionPlan }, status =>
    buildingTxToast(status, toastId, 'Building swap claim transaction'),
  );
  const txHash = await getTxHash(transaction);
  const { detectionHeight } = await broadcast({ transaction, awaitDetection: true }, status =>
    broadcastingTxToast(txHash, status, toastId),
  );
  successTxToast(txHash, detectionHeight, toastId, 'Swap claim transaction succeeded! 🎉');
};

export const swapSelector = (state: AllSlices) => state.swap;
