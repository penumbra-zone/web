import { AllSlices, SliceCreator } from './index';
import {
  fromValueView,
  getAddress,
  getAddressIndex,
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
  isPenumbraAddr,
  toBaseUnit,
} from '@penumbra-zone/types';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import BigNumber from 'bignumber.js';
import {
  broadcastingTxToast,
  buildingTxToast,
  errorTxToast,
  infoTxToast,
  successTxToast,
} from '../components/shared/toast-content';
import { AssetBalance } from '../fetchers/balances';
import { MemoPlaintext } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { authWitnessBuild, broadcast, getTxHash, plan } from './helpers';

import {
  Fee,
  FeeTier_Tier,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';
import { ConnectError } from '@connectrpc/connect';

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
  sendTx: () => Promise<void>;
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

      const txPlan = await plan(assembleRequest(get().send));
      const fee = txPlan.transactionParameters?.fee;
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
    sendTx: async () => {
      set(state => {
        state.send.txInProgress = true;
      });

      const txToastId = buildingTxToast();

      try {
        const transactionPlan = await plan(assembleRequest(get().send));
        const transaction = await authWitnessBuild({ transactionPlan }, status =>
          buildingTxToast(status, txToastId),
        );
        const txHash = await getTxHash(transaction);
        const { detectionHeight } = await broadcast({ transaction, awaitDetection: true }, status =>
          broadcastingTxToast(txHash, status, txToastId),
        );
        successTxToast(txHash, detectionHeight, txToastId);

        // Reset form
        set(state => {
          state.send.amount = '';
        });
      } catch (e) {
        /**
         * @todo: The error flow between extension <-> webapp needs to be
         * refactored a bit. Right now, if we throw a `ConnectError` with
         * `Code.PermissionDenied` (as we do in the approver), it gets swallowed
         * by ConnectRPC's internals and rethrown via `ConnectError.from()`.
         * This means that the original code is lost, although the stringified
         * error message still contains `[permission_denied]`. So we'll
         * (somewhat hackily) check the stringified error message for now; but
         * in the future, we need ot get the error flow working properly so that
         * we can actually check `e.code === Code.PermissionDenied`.
         */
        if (e instanceof ConnectError && e.message.includes('[permission_denied]')) {
          infoTxToast('Transaction canceled.', undefined, txToastId);
        } else {
          errorTxToast(e, txToastId);
          throw e;
        }
      } finally {
        set(state => {
          state.send.txInProgress = false;
        });
      }
    },
  };
};

const assembleRequest = ({ amount, feeTier, recipient, selection, memo }: SendSlice) => {
  return new TransactionPlannerRequest({
    outputs: [
      {
        address: { altBech32m: recipient },
        value: {
          amount: toBaseUnit(
            BigNumber(amount),
            getDisplayDenomExponentFromValueView(selection?.value),
          ),
          assetId: getAssetIdFromValueView(selection?.value),
        },
      },
    ],
    source: getAddressIndex(selection?.address),

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
      returnAddress: getAddress(selection?.address),
      text: memo,
    }),
  });
};

export const validateAmount = (
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
