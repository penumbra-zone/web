import { assets } from '@penumbra-zone/constants';
import { validateAmount, validateRecipient } from '../utils';
import { AllSlices, SliceCreator } from './index';
import {
  Asset,
  AssetId as TempAssetId,
  base64ToUint8Array,
  splitLoHi,
  uint8ArrayToHex,
} from '@penumbra-zone/types';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

export interface SendValidationFields {
  recipient: boolean;
  amount: boolean;
}

export interface SendSlice {
  amount: string;
  asset: Asset;
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
  sendTx: () => Promise<string>;
}

export const createSendSlice = (): SliceCreator<SendSlice> => (set, get) => {
  return {
    amount: '',
    asset: assets[0]!,
    recipient: '',
    memo: '',
    hidden: false,
    assetBalance: 0,
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
        state.send.validationErrors.recipient = validateRecipient(addr);
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
    // TODO: implement UI to show tx states and have error handling
    sendTx: async () => {
      const amount = splitLoHi(BigInt(get().send.amount));
      const req = new TransactionPlannerRequest({
        outputs: [
          {
            address: { altBech32m: get().send.recipient },
            value: {
              amount: { lo: amount.lo, hi: amount.hi },
              assetId: { inner: base64ToUint8Array(get().send.asset.penumbraAssetId.inner) },
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
    },
  };
};

export const sendSelector = (state: AllSlices) => state.send;
