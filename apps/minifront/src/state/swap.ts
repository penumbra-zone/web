import { AllSlices, SliceCreator } from '.';
import {
  BalancesResponse,
  TransactionPlannerRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  authWitnessBuild,
  broadcast,
  getTxHash,
  plan,
  userDeniedTransaction,
  witnessBuild,
} from './helpers';
import {
  Metadata,
  Value,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { BigNumber } from 'bignumber.js';
import { getAddressByIndex } from '../fetchers/address';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';
import { errorToast, TransactionToast } from '@penumbra-zone/ui';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { SimulateTradeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { simulateClient } from '../clients';
import {
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/src/value-view';
import { getAssetId } from '@penumbra-zone/getters/src/metadata';
import { getSwapCommitmentFromTx } from '@penumbra-zone/getters/src/transaction';
import { getAddressIndex } from '@penumbra-zone/getters/src/address-view';
import { toBaseUnit } from '@penumbra-zone/types/src/lo-hi';

export interface SimulateSwapResult {
  output: ValueView;
  unfilled: ValueView;
}

export interface SwapSlice {
  assetIn: BalancesResponse | undefined;
  setAssetIn: (asset: BalancesResponse) => void;
  amount: string;
  setAmount: (amount: string) => void;
  assetOut: Metadata | undefined;
  setAssetOut: (metadata: Metadata) => void;
  initiateSwapTx: () => Promise<void>;
  txInProgress: boolean;
  simulateSwap: () => Promise<void>;
  simulateOutResult: SimulateSwapResult | undefined;
  simulateOutLoading: boolean;
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
    simulateOutLoading: false,
    simulateSwap: async () => {
      try {
        set(({ swap }) => {
          swap.simulateOutLoading = true;
        });

        const assetIn = get().swap.assetIn;
        const assetOut = get().swap.assetOut;
        if (!assetIn || !assetOut) throw new Error('Both asset in and out need to be set');

        const swapInValue = new Value({
          assetId: getAssetIdFromValueView(assetIn.balanceView),
          amount: toBaseUnit(
            BigNumber(get().swap.amount || 0),
            getDisplayDenomExponentFromValueView(assetIn.balanceView),
          ),
        });
        const req = new SimulateTradeRequest({
          input: swapInValue,
          output: getAssetId(assetOut),
        });
        const res = await simulateClient.simulateTrade(req);

        const output = new ValueView({
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: res.output?.output?.amount,
              metadata: assetOut,
            },
          },
        });

        const unfilled = new ValueView({
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: res.unfilled?.amount,
              metadata: getMetadata(assetIn.balanceView),
            },
          },
        });

        set(({ swap }) => {
          swap.simulateOutResult = { output, unfilled };
        });
      } catch (e) {
        errorToast(e, 'Error estimating swap').render();
      } finally {
        set(({ swap }) => {
          swap.simulateOutLoading = false;
        });
      }
    },
    initiateSwapTx: async () => {
      set(state => {
        state.swap.txInProgress = true;
      });

      try {
        const swapTx = await issueSwap(get().swap);
        const swapCommitment = getSwapCommitmentFromTx(swapTx);
        await issueSwapClaim(swapCommitment);
        set(state => {
          state.swap.amount = '';
        });
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

  const addressIndex = getAddressIndex(assetIn.accountAddress);

  return new TransactionPlannerRequest({
    swaps: [
      {
        targetAsset: getAssetId(assetOut),
        value: {
          amount: toBaseUnit(
            BigNumber(amount),
            getDisplayDenomExponentFromValueView(assetIn.balanceView),
          ),
          assetId: getAssetIdFromValueView(assetIn.balanceView),
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
    source: getAddressIndex(assetIn.accountAddress),
  });
};

export const issueSwap = async (swapSlice: SwapSlice): Promise<Transaction | undefined> => {
  const swapToast = new TransactionToast('swap');
  swapToast.onStart();

  try {
    const swapReq = await assembleSwapRequest(swapSlice);
    const swapPlan = await plan(swapReq);
    const swapTx = await authWitnessBuild({ transactionPlan: swapPlan }, status =>
      swapToast.onBuildStatus(status),
    );
    const swapTxHash = await getTxHash(swapTx);
    swapToast.txHash(swapTxHash);
    await broadcast({ awaitDetection: true, transaction: swapTx }, status =>
      swapToast.onBroadcastStatus(status),
    );
    swapToast.onSuccess();
    return swapTx;
  } catch (e) {
    if (userDeniedTransaction(e)) {
      swapToast.onDenied();
      return undefined;
    } else {
      swapToast.onFailure(e);
      return undefined;
    }
  }
};

// Swap claims don't need authenticationData, so `witnessAndBuild` is used.
// This way it won't trigger a second, unnecessary approval popup.
// @see https://protocol.penumbra.zone/main/zswap/swap.html#claiming-swap-outputs
export const issueSwapClaim = async (swapCommitment: StateCommitment) => {
  const toast = new TransactionToast('swapClaim');
  toast.onStart();

  try {
    const swapClaimReq = new TransactionPlannerRequest({ swapClaims: [{ swapCommitment }] });
    const transactionPlan = await plan(swapClaimReq);
    const transaction = await witnessBuild({ transactionPlan }, status =>
      toast.onBuildStatus(status),
    );
    const txHash = await getTxHash(transaction);
    toast.txHash(txHash);
    const { detectionHeight } = await broadcast({ transaction, awaitDetection: true }, status =>
      toast.onBroadcastStatus(status),
    );
    toast.onSuccess(detectionHeight);
  } catch (e) {
    toast.onFailure(e);
  }
};

export const swapSelector = (state: AllSlices) => state.swap;
