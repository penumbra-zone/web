import { AllSlices, SliceCreator } from './index';
import { toast } from '@penumbra-zone/ui/components/ui/use-toast';
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
  toBaseUnit,
} from '@penumbra-zone/types';
import BigNumber from 'bignumber.js';
import { getAddressByIndex } from '../fetchers/address';
import { Swap } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
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

      const { dismiss, update } = toastFn(buildingTxToast());

      try {
        // build swap
        const swapPlan = await plan(await assembleSwapRequest(get().swap));
        const swapTx = await authWitnessBuild(update, { transactionPlan: swapPlan });

        // begin broadcast
        const swapBroadcast = broadcast(update, {
          awaitDetection: true,
          transaction: swapTx,
        });

        // a swap claim must be broadcast after any successful swap, to claim
        // the output of the swap.  Swap claims don't need authenticationData,
        // so use `witnessAndBuild`
        // @see https://protocol.penumbra.zone/main/zswap/swap.html#claiming-swap-outputs

        // start to build swap claim
        const swapCommitment = getSwapCommitment(swapTx);

        const swapClaimPlan = await plan(assembleSwapClaimRequest(swapCommitment));
        const swapClaimTx = await witnessBuild(update, { transactionPlan: swapClaimPlan });

        // after swap broadcast success, emit the claim
        await swapBroadcast;
        const { txHash: swapClaimHash, detectionHeight: swapClaimDetectionHeight } =
          await broadcast(update, {
            transaction: swapClaimTx,
          });

        update(successTxToast(swapClaimHash, swapClaimDetectionHeight));

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

const getSwapCommitment = (transaction: Transaction): StateCommitment => {
  const swap = transaction.body?.actions.find(action => action.action.case === 'swap')?.action
    .value as Swap | undefined;
  if (!swap) throw new Error('Swap action could not be found in transaction for swap claim');
  if (!swap.body?.payload?.commitment)
    throw new Error('Swap commitment could not be found in swap action');

  return swap.body.payload.commitment;
};

const assembleSwapClaimRequest = (swapCommitment: StateCommitment) => {
  return new TransactionPlannerRequest({
    swapClaims: [
      {
        swapCommitment,
      },
    ],
  });
};

export const swapSelector = (state: AllSlices) => state.swap;
