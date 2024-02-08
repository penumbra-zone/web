import { AllSlices, SliceCreator } from './index';
import {
  address,
  addressIndex,
  assetId,
  denomMetadata,
  fromValueView,
  getDisplayDenomExponent,
  isPenumbraAddr,
  toBaseUnit,
} from '@penumbra-zone/types';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { toast } from '@penumbra-zone/ui/components/ui/use-toast';
import BigNumber from 'bignumber.js';
import { errorTxToast, loadingTxToast, successTxToast } from '../components/shared/toast-content';
import { AssetBalance } from '../fetchers/balances';
import { MemoPlaintext } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { getTransactionPlan, planWitnessBuildBroadcast } from './helpers';

import {
  Fee,
  FeeTier_Tier,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';
import { z } from 'zod';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

export interface SendSlice {
  selection: AssetBalance | undefined;
  setSelection: (selection: AssetBalance) => void;
  amount: string;
  setAmount: (amount: string) => void;
  recipient: string;
  setRecipient: (addr: string) => void;
  memo: string;
  setMemo: (txt: string) => void;
  fee: Fee | undefined;
  refreshFee: () => Promise<void>;
  feeTier: FeeTier_Tier;
  setFeeTier: (feeTier: FeeTier_Tier) => void;
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
    feeTier: FeeTier_Tier.LOW,
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

      const txnPlanReq = assembleRequest(get().send);
      const plan = await getTransactionPlan(txnPlanReq);
      const fee = plan?.transactionParameters?.fee;
      if (!fee?.amount) return;

      set(state => {
        state.send.fee = fee;
      });
    },
    setFeeTier: feeTier => {
      set(state => {
        state.send.feeTier = feeTier;
      });
    },
    sendTx: async toastFn => {
      set(state => {
        state.send.txInProgress = true;
      });

      const { dismiss } = toastFn(loadingTxToast);

      try {
        const req = assembleRequest(get().send);
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

export const selectionSchema = z.object({
  value: z.object({
    valueView: z.object({
      case: z.literal('knownAssetId'),
      value: z.object({
        metadata: denomMetadata.extend({ penumbraAssetId: assetId }).required(),
      }),
    }),
  }),

  address: z.object({
    addressView: z.object({
      case: z.literal('decoded'),
      value: z.object({
        address,
        index: addressIndex,
      }),
    }),
  }),
});

const assembleRequest = ({ amount, feeTier, recipient, selection, memo }: SendSlice) => {
  const validatedSelection = selectionSchema.parse(selection);

  return new TransactionPlannerRequest({
    outputs: [
      {
        address: { altBech32m: recipient },
        value: {
          amount: toBaseUnit(
            BigNumber(amount),
            getDisplayDenomExponent(
              new Metadata(validatedSelection.value.valueView.value.metadata),
            ),
          ),
          assetId: validatedSelection.value.valueView.value.metadata.penumbraAssetId,
        },
      },
    ],
    source: validatedSelection.address.addressView.value.index,

    // Note: we currently don't provide a UI for setting the fee manually. Thus,
    // a `feeMode` of `manualFee` is not supported here.
    feeMode:
      typeof feeTier === 'undefined'
        ? { case: undefined }
        : {
            case: 'autoFee',
            value: { feeTier },
          },

    memo: new MemoPlaintext({
      returnAddress: validatedSelection.address.addressView.value.address,
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
  if (asset.value.valueView.case !== 'knownAssetId') throw new Error('unknown asset selected');

  const balanceAmt = fromValueView(asset.value.valueView.value);
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
