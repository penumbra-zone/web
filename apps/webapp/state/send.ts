import { assets } from '@penumbra-zone/constants';
import { validateAmount } from '../utils';
import { AllSlices, SliceCreator } from './index';
import {
  Asset as TempAsset,
  AssetId as TempAssetId,
  base64ToUint8Array,
  isPenumbraAddr,
  toBaseUnit,
  uint8ArrayToHex,
} from '@penumbra-zone/types';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { toast } from '@penumbra-zone/ui/components/ui/use-toast';
import { errorTxToast, loadingTxToast, successTxToast } from '../shared/toast-content';

export interface SendValidationFields {
  recipient: boolean;
  amount: boolean;
}

export interface SendSlice {
  amount: string;
  asset: TempAsset;
  recipient: string;
  memo: string;
  hidden: boolean;
  validationErrors: SendValidationFields;
  assetBalance: number;
  setAmount: (amount: string) => void;
  setAsset: (asset: TempAssetId) => void;
  setRecipient: (addr: string) => void;
  setMemo: (txt: string) => void;
  setHidden: (checked: boolean) => void;
  setAssetBalance: (amount: number) => void;
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
    assetBalance: 0,
    txInProgress: false,
    validationErrors: {
      recipient: false,
      amount: false,
    },
    setAmount: amount => {
      const { assetBalance } = get().send;

      set(state => {
        state.send.amount = amount;
        state.send.validationErrors.amount = validateAmount(amount, assetBalance);
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
        state.send.validationErrors.recipient = Boolean(addr) && !isPenumbraAddr(addr);
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
    setAssetBalance: balance => {
      const { amount } = get().send;
      set(state => {
        state.send.assetBalance = balance;
        state.send.validationErrors.amount = validateAmount(amount, balance);
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
          amount: toBaseUnit(Number(amount), getExponent(asset)),
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

export const sendSelector = (state: AllSlices) => state.send;
