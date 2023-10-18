import { assets } from 'penumbra-constants';
import { validateAmount, validateRecipient } from '../utils';
import { AllSlices, SliceCreator } from './index';
import { Asset, AssetId as TempAssetId, base64ToUint8Array, splitLoHi } from 'penumbra-types';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import {
  TransactionPlannerRequest,
  TransactionPlannerRequest_Output,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import {
  AssetId,
  Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { custodyClient } from '../clients/grpc';

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
    sendTx: async () => {
      const amount = splitLoHi(BigInt(get().send.amount));
      const assetId = get().send.asset.penumbraAssetId;
      const req = new TransactionPlannerRequest({
        outputs: [
          new TransactionPlannerRequest_Output({
            address: new Address({ altBech32m: get().send.recipient }),
            value: new Value({
              amount: new Amount({
                lo: amount.lo,
                hi: amount.hi,
              }),
              assetId: new AssetId({
                inner: base64ToUint8Array(assetId.inner),
              }),
            }),
          }),
        ],
      });

      const { viewClient } = await import('../clients/grpc');
      const { plan } = await viewClient.transactionPlanner(req);
      if (!plan) throw new Error('no plan in response');

      const { data } = await custodyClient.authorize({ plan });
      if (!data) throw new Error('no authorization data in response');

      console.log(data);

      return 'done!';

      // TODO: Finish this flow
      // const { transaction } = await viewClient.witnessAndBuild({
      //   transactionPlan: plan,
      //   authorizationData: data,
      // });
      // if (!transaction) throw new Error('no transaction in response');
      //
      // const { id } = await viewClient.broadcastTransaction({ transaction, awaitDetection: true });
      // if (!id) throw new Error('no id in broadcast response');
      //
      // return uint8ArrayToHex(id.hash);
    },
  };
};

export const sendSelector = (state: AllSlices) => state.send;
