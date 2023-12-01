import { AllSlices, SliceCreator } from './index';
import {
  fromBaseUnitAmount,
  isPenumbraAddr,
  toBaseUnit,
  uint8ArrayToHex,
} from '@penumbra-zone/types';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { toast } from '@penumbra-zone/ui/components/ui/use-toast';
import BigNumber from 'bignumber.js';
import { errorTxToast, loadingTxToast, successTxToast } from '../components/shared/toast-content';
import { AssetBalance } from '../fetchers/balances';
import { getIndexByAddress } from '../fetchers/index-by-address';

export interface SendSlice {
  account: string;
  asset: AssetBalance | undefined;
  setAccountAsset: (account: string, asset: AssetBalance) => void;
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
    account: '',
    amount: '',
    asset: undefined,
    recipient: '',
    memo: '',
    hidden: false,
    txInProgress: false,
    setAmount: amount => {
      set(state => {
        state.send.amount = amount;
      });
    },
    setAccountAsset: (account, asset) => {
      set(state => {
        state.send.asset = asset;
        state.send.account = account;
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

const getExponent = (asset: AssetBalance): number => asset.denom.exponent;

const planWitnessBuildBroadcast = async ({ amount, recipient, asset, account }: SendSlice) => {
  if (typeof account === 'undefined') throw new Error('no selected account');
  if (!asset) throw new Error('no selected asset');

  const source = await getIndexByAddress(account);

  const req = new TransactionPlannerRequest({
    outputs: [
      {
        address: { altBech32m: recipient },
        value: {
          amount: toBaseUnit(BigNumber(amount), getExponent(asset)),
          assetId: { inner: asset.assetId.inner },
        },
      },
    ],
    source,
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

export const amountToBig = (asset: AssetBalance) =>
  fromBaseUnitAmount(asset.amount, asset.denom.exponent);

export const validateAmount = (asset: AssetBalance, amount: string): boolean => {
  const balanceAmt = amountToBig(asset);
  return Boolean(amount) && BigNumber(amount).gt(balanceAmt);
};

export interface SendValidationFields {
  recipientErr: boolean;
  amountErr: boolean;
}

export const sendValidationErrors = (
  asset: AssetBalance | undefined,
  amount: string,
  recipient: string,
): SendValidationFields => {
  return {
    recipientErr: Boolean(recipient) && !isPenumbraAddr(recipient),
    amountErr: !asset ? false : validateAmount(asset, amount),
  };
};

export const sendSelector = (state: AllSlices) => state.send;
