import { assets } from 'penumbra-constants';
import { validateAmount, validateRecipient } from '../utils';
import { AllSlices, SliceCreator } from './index';
import {
  Asset,
  AssetId as TempAssetId,
  base64ToUint8Array,
  stringToUint8Array,
} from 'penumbra-types';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import {
  TransactionPlannerRequest,
  TransactionPlannerRequest_Output,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import {
  AssetId,
  Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

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
      const { viewClient } = await import('../clients/grpc');
      const { plan } = await viewClient.transactionPlanner(reqFromForm());
      if (!plan) throw new Error('no plan in response');

      return 'done';

      // const { data } = await custodyClient.authorize({ plan });
      // if (!data) throw new Error('no authorization data in response');
      //
      // const { transaction } = await viewClient.authorizeAndBuild({
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

const reqFromForm = (): TransactionPlannerRequest => {
  return new TransactionPlannerRequest({
    outputs: [
      new TransactionPlannerRequest_Output({
        address: new Address({ inner: stringToUint8Array('penumbra123') }),
        value: new Value({
          amount: new Amount({
            lo: 10034234n,
            hi: 10n,
          }),
          assetId: new AssetId({
            inner: base64ToUint8Array('YZJU/tnH3oPBb56araLN8OP594cPuoLcSalWPk9PfQs='),
          }),
        }),
      }),
    ],
  });
};

export const sendSelector = (state: AllSlices) => state.send;
