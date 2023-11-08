import { assets } from '@penumbra-zone/constants';
import { AllSlices, SliceCreator } from './index.ts';
import {
  Asset as TempAsset,
  AssetId as TempAssetId,
  base64ToUint8Array,
  fromBaseUnitAmount,
  isPenumbraAddr,
  toBaseUnit,
  uint8ArrayToHex,
} from '@penumbra-zone/types';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { toast } from '@penumbra-zone/ui/components/ui/use-toast.ts';
import BigNumber from 'bignumber.js';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import {
  errorTxToast,
  loadingTxToast,
  successTxToast,
} from '../components/shared/toast-content.tsx';

export interface SendSlice {
  asset: TempAsset;
  setAsset: (asset: TempAssetId) => void;
  amount: string;
  setAmount: (amount: string) => void;
  recipient: string;
  setRecipient: (addr: string) => void;
  memo: string;
  setMemo: (txt: string) => void;
  hidden: boolean;
  setHidden: (checked: boolean) => void;
  sendTx: (toastFn: typeof toast) => Promise<void>;
  txInProgress: boolean;
}

export const createSendSlice = (): SliceCreator<SendSlice> => (set, get) => {
  return {
    amount: '',
    asset: assets[0]!,
    recipient: '',
    memo: '',
    hidden: false,
    txInProgress: false,
    setAmount: amount => {
      set(state => {
        state.send.amount = amount;
      });
    },
    setAsset: asset => {
      const selectedAsset = assets.find(i => i.penumbraAssetId.inner === asset.inner)!;
      set(state => {
        state.send.asset = selectedAsset;
      });
    },
    setRecipient: addr => {
      set(state => {
        state.send.recipient = addr;
      });
    },
    setMemo: txt => {
      set(state => {
        state.send.memo = txt;
      });
    },
    setHidden: (checked: boolean) => {
      set(state => {
        state.send.hidden = checked;
      });
    },
    sendTx: async toastFn => {
      set(state => {
        state.send.txInProgress = true;
      });

      const { dismiss } = toastFn(loadingTxToast);

      try {
        const txHash = await planWitnessBuildBroadcast(get().send);
        dismiss();
        toastFn(successTxToast(txHash));

        // Reset form
        set(state => {
          state.send.amount = '';
          state.send.txInProgress = false;
        });
      } catch (e) {
        set(state => {
          state.send.txInProgress = false;
        });
        dismiss();
        toastFn(errorTxToast(e));
      }
    },
  };
};

const getExponent = (asset: TempAsset): number => {
  const match = asset.denomUnits.find(u => u.denom === asset.display);
  return match?.exponent ?? 0;
};

const planWitnessBuildBroadcast = async ({ amount, recipient, asset }: SendSlice) => {
  const req = new TransactionPlannerRequest({
    outputs: [
      {
        address: { altBech32m: recipient },
        value: {
          amount: toBaseUnit(BigNumber(amount), getExponent(asset)),
          assetId: { inner: base64ToUint8Array(asset.penumbraAssetId.inner) },
        },
      },
    ],
  });

  const { viewClient, custodyClient } = await import('../clients/grpc');
  const { plan } = await viewClient.transactionPlanner(req);
  if (!plan) throw new Error('no plan in response');

  const { data: authorizationData } = await custodyClient.authorize({ plan });
  if (!authorizationData) throw new Error('no authorization data in response');

  const { transaction } = await viewClient.witnessAndBuild({
    transactionPlan: plan,
    authorizationData,
  });
  if (!transaction) throw new Error('no transaction in response');

  const { id } = await viewClient.broadcastTransaction({ transaction, awaitDetection: true });
  if (!id) throw new Error('no id in broadcast response');

  return uint8ArrayToHex(id.hash);
};

export const amountToBig = (asset: TempAsset, assetBalance: Amount) => {
  const exponent = asset.denomUnits.find(d => d.denom === asset.display)!.exponent;
  return fromBaseUnitAmount(assetBalance, exponent);
};

export const validateAmount = (asset: TempAsset, amount: string, assetBalance: Amount): boolean => {
  const balanceAmt = amountToBig(asset, assetBalance);
  return Boolean(amount) && BigNumber(amount).gt(balanceAmt);
};

export interface SendValidationFields {
  recipientErr: boolean;
  amountErr: boolean;
}

export const sendValidationErrors = (
  asset: TempAsset,
  amount: string,
  recipient: string,
  assetBalance: Amount,
): SendValidationFields => {
  return {
    recipientErr: Boolean(recipient) && !isPenumbraAddr(recipient),
    amountErr: validateAmount(asset, amount, assetBalance),
  };
};

export const sendSelector = (state: AllSlices) => state.send;
