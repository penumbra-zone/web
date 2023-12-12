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
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { Selection } from './types';
import { MemoPlaintext } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

export interface SendSlice {
  selection: Selection | undefined;
  setSelection: (selection: Selection) => void;
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
    selection: undefined,
    amount: '',
    recipient: '',
    memo: '',
    hidden: false,
    txInProgress: false,
    setAmount: amount => {
      set(state => {
        state.send.amount = amount;
      });
    },
    setSelection: selection => {
      set(state => {
        state.send.selection = selection;
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

const planWitnessBuildBroadcast = async ({
  amount,
  recipient,
  selection,
  hidden,
  memo,
}: SendSlice) => {
  if (typeof selection?.accountIndex === 'undefined') throw new Error('no selected account');
  if (!selection.asset) throw new Error('no selected asset');

  const { getAddressByIndex, getEphemeralAddress } = await import('../fetchers/address.ts');

  const req = new TransactionPlannerRequest({
    outputs: [
      {
        address: { altBech32m: recipient },
        value: {
          amount: toBaseUnit(BigNumber(amount), selection.asset.denom.exponent),
          assetId: { inner: selection.asset.assetId.inner },
        },
      },
    ],
    source: new AddressIndex({ account: selection.accountIndex }),
    memo: new MemoPlaintext({
      returnAddress: hidden
        ? await getEphemeralAddress(selection.accountIndex)
        : await getAddressByIndex(selection.accountIndex),
      text: memo,
    }),
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

export const validateAmount = (asset: AssetBalance, amount: string): boolean => {
  const balanceAmt = fromBaseUnitAmount(asset.amount, asset.denom.exponent);
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
