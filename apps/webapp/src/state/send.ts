import { AllSlices, SliceCreator } from './index';
import {
  fromBaseUnitAmountAndDenomMetadata,
  isPenumbraAddr,
  toBaseUnit,
} from '@penumbra-zone/types';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { toast } from '@penumbra-zone/ui/components/ui/use-toast';
import BigNumber from 'bignumber.js';
import { errorTxToast, loadingTxToast, successTxToast } from '../components/shared/toast-content';
import { AssetBalance } from '../fetchers/balances';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { Selection } from './types';
import { MemoPlaintext } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { getAddressByIndex } from '../fetchers/address';
import { getTransactionPlan, planWitnessBuildBroadcast } from './helpers.ts';
import { Fee } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';
import { getDisplayDenomExponent } from '@penumbra-zone/types/src/denom-metadata.ts';

export interface SendSlice {
  selection: Selection | undefined;
  setSelection: (selection: Selection) => void;
  amount: string;
  setAmount: (amount: string) => void;
  recipient: string;
  setRecipient: (addr: string) => void;
  memo: string;
  setMemo: (txt: string) => void;
  fee: Fee | undefined;
  refreshFee: () => Promise<void>;
  sendTx: (toastFn: typeof toast) => Promise<void>;
  txInProgress: boolean;
}

export const createSendSlice = (): SliceCreator<SendSlice> => (set, get) => {
  return {
    selection: undefined,
    amount: '',
    recipient: '',
    memo: '',
    fee: undefined,
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
    refreshFee: async () => {
      const { amount, recipient, selection } = get().send;

      if (!amount || !recipient || !selection) {
        set(state => {
          state.send.fee = undefined;
        });
        return;
      }

      const txnPlanReq = await assembleRequest(get().send);
      const plan = await getTransactionPlan(txnPlanReq);
      const fee = plan?.transactionParameters?.fee;
      if (!fee?.amount) return;

      set(state => {
        state.send.fee = fee;
      });
    },
    sendTx: async toastFn => {
      set(state => {
        state.send.txInProgress = true;
      });

      const { dismiss } = toastFn(loadingTxToast);

      try {
        const req = await assembleRequest(get().send);
        const txHash = await planWitnessBuildBroadcast(req);
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
        throw e;
      }
    },
  };
};

const assembleRequest = async ({ amount, recipient, selection, memo }: SendSlice) => {
  if (typeof selection?.accountIndex === 'undefined') throw new Error('no selected account');
  if (!selection.asset) throw new Error('no selected asset');

  return new TransactionPlannerRequest({
    outputs: [
      {
        address: { altBech32m: recipient },
        value: {
          amount: toBaseUnit(
            BigNumber(amount),
            getDisplayDenomExponent(selection.asset.denomMetadata),
          ),
          assetId: { inner: selection.asset.assetId.inner },
        },
      },
    ],
    source: new AddressIndex({ account: selection.accountIndex }),
    memo: new MemoPlaintext({
      returnAddress: await getAddressByIndex(selection.accountIndex),
      text: memo,
    }),
  });
};

const validateAmount = (
  asset: AssetBalance,
  /**
   * The amount that a user types into the interface will always be in the
   * display denomination -- e.g., in `penumbra`, not in `upenumbra`.
   */
  amountInDisplayDenom: string,
): boolean => {
  const balanceAmt = fromBaseUnitAmountAndDenomMetadata(asset.amount, asset.denomMetadata);
  return Boolean(amountInDisplayDenom) && BigNumber(amountInDisplayDenom).gt(balanceAmt);
};

export interface SendValidationFields {
  recipientErr: boolean;
  amountErr: boolean;
  memoErr: boolean;
}

export const sendValidationErrors = (
  asset: AssetBalance | undefined,
  amount: string,
  recipient: string,
  memo?: string,
): SendValidationFields => {
  return {
    recipientErr: Boolean(recipient) && !isPenumbraAddr(recipient),
    amountErr: !asset ? false : validateAmount(asset, amount),
    // The memo cannot exceed 512 bytes
    // return address uses 80 bytes
    // so 512-80=432 bytes for memo text
    memoErr: new TextEncoder().encode(memo).length > 432,
  };
};

export const sendSelector = (state: AllSlices) => state.send;
