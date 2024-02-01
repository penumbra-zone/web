import { AllSlices, SliceCreator } from './index';
import { errorTxToast, loadingTxToast, successTxToast } from '../components/shared/toast-content';
import { toast } from '@penumbra-zone/ui/components/ui/use-toast';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { planWitnessBuildBroadcast } from './helpers';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { AssetBalance } from '../fetchers/balances';
import { toBaseUnit } from '@penumbra-zone/types';
import BigNumber from 'bignumber.js';
import { getDisplayDenomExponent } from '@penumbra-zone/types/src/denom-metadata';
import { getAddressByIndex } from '../fetchers/address';

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
  if (assetIn?.value.valueView.case !== 'knownAssetId') throw new Error('unknown denom selected');
  if (!assetIn.value.valueView.value.metadata?.penumbraAssetId)
    throw new Error('missing metadata for assetIn');
  if (assetIn.address.addressView.case !== 'decoded')
    throw new Error('address in view is not decoded');
  if (!assetIn.address.addressView.value.index) throw new Error('No index for assetIn address');
  if (assetOut?.penumbraAssetId === undefined) throw new Error('assetOut has no asset id');

  return new TransactionPlannerRequest({
    swaps: [
      {
        targetAsset: assetOut.penumbraAssetId,
        value: {
          amount: toBaseUnit(
            BigNumber(amount),
            getDisplayDenomExponent(assetIn.value.valueView.value.metadata),
          ),
          assetId: assetIn.value.valueView.value.metadata.penumbraAssetId,
        },
        claimAddress: await getAddressByIndex(assetIn.address.addressView.value.index.account),
        // TODO: Calculate this properly in subsequent PR
        //       Asset Id should almost certainly be upenumbra,
        //       may need to indicate native denom in registry
        fee: {
          amount: toBaseUnit(
            BigNumber(amount),
            getDisplayDenomExponent(assetIn.value.valueView.value.metadata),
          ),
          assetId: assetIn.value.valueView.value.metadata.penumbraAssetId,
        },
      },
    ],
    source: assetIn.address.addressView.value.index,
  });
};

export const swapSelector = (state: AllSlices) => state.swap;
