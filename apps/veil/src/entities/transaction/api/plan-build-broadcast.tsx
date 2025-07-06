import Link from 'next/link';
import {
  TransactionPlannerRequest,
  TransactionInfo,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { ViewService } from '@penumbra-zone/protobuf';
import { Transaction } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { openToast } from '@penumbra-zone/ui/Toast';
import {
  TransactionClassification,
  TRANSACTION_LABEL_BY_CLASSIFICATION,
} from '@/shared/utils/transaction-classify';
import { uint8ArrayToHex, hexToUint8Array } from '@penumbra-zone/types/hex';
import { TransactionId } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import { penumbra } from '@/shared/const/penumbra';
import { shorten } from '@penumbra-zone/types/string';
import { getOneWaySwapValues } from '@penumbra-zone/types/swap';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { getMetadata as getMetadataFromValueView } from '@penumbra-zone/getters/value-view';
import { txToId } from '../model/tx-to-id';
import { getBroadcastStatusMessage, getBuildStatusDescription } from '../model/status';
import { userDeniedTransaction, unauthenticated } from '../model/validations';
import { planTransaction } from './plan';
import { broadcastTransaction } from './broadcast';
import { buildTransaction } from './build';

async function fetchTransaction(
  id: TransactionId,
  message: string,
): Promise<TransactionInfo | undefined> {
  try {
    const currentTxInfoResponse = await penumbra.service(ViewService).transactionInfoByHash({ id });
    return currentTxInfoResponse.txInfo;
  } catch (e) {
    console.warn(message, e);
    return undefined;
  }
}

async function* swapTransactions(tx?: TransactionInfo): AsyncGenerator<TransactionInfo> {
  if (!tx) {
    return;
  }
  for (const { actionView } of tx.view?.bodyView?.actionViews ?? []) {
    if (actionView.case !== 'swapClaim') {
      continue;
    }
    const swapClaimView = actionView.value.swapClaimView;
    if (swapClaimView.case !== 'visible') {
      continue;
    }
    const swapTx = swapClaimView.value.swapTx;
    if (!swapTx) {
      continue;
    }
    const tx = await fetchTransaction(swapTx, 'Could not fetch original swap transaction details');
    if (!tx) {
      continue;
    }
    yield tx;
  }
}

async function* unfilledSwaps(originalTx?: TransactionInfo): AsyncGenerator<ValueView> {
  for await (const tx of swapTransactions(originalTx)) {
    for (const { actionView } of tx.view?.bodyView?.actionViews ?? []) {
      if (actionView.case !== 'swap') {
        continue;
      }
      const { unfilled } = getOneWaySwapValues(actionView.value);
      if (!unfilled) {
        continue;
      }
      yield unfilled;
    }
  }
}

/**
 * Handles the common use case of planning, building, and broadcasting a
 * transaction, along with the appropriate toasts. Throws if there is an
 * unhandled error (i.e., any error other than the user denying authorization
 * for the transaction) so that consuming code can take different actions based
 * on whether the transaction succeeded or failed.
 */
export const planBuildBroadcast = async (
  transactionClassification: TransactionClassification,
  req: PartialMessage<TransactionPlannerRequest>,
  options?: {
    /**
     * If set to `true`, the `ViewService#witnessAndBuild` method will be used,
     * which does not prompt the user to authorize the transaction. If `false`,
     * the `ViewService#authorizeAndBuild` method will be used, which _does_
     * prompt the user to authorize the transaction. (This is required in the
     * case of most transactions.) Default: `false`
     */
    skipAuth?: boolean;
  },
): Promise<Transaction | undefined> => {
  const label =
    transactionClassification in TRANSACTION_LABEL_BY_CLASSIFICATION
      ? TRANSACTION_LABEL_BY_CLASSIFICATION[transactionClassification]
      : '';

  const toast = openToast({
    type: 'loading',
    message: `Building ${label} transaction`,
    dismissible: false,
    persistent: true,
  });

  const rpcMethod = options?.skipAuth
    ? penumbra.service(ViewService).witnessAndBuild
    : penumbra.service(ViewService).authorizeAndBuild;

  try {
    const transactionPlan = await planTransaction(req);

    const transaction = await buildTransaction({ transactionPlan }, rpcMethod, status => {
      toast.update({
        description: getBuildStatusDescription(status),
      });
    });

    const txHash = uint8ArrayToHex((await txToId(transaction)).inner);
    const shortenedTxHash = shorten(txHash, 8);

    const { detectionHeight } = await broadcastTransaction(
      { transaction, awaitDetection: true },
      status =>
        toast.update({
          type: 'success',
          message: getBroadcastStatusMessage(label, status),
          description: shortenedTxHash,
        }),
    );

    let unfilledSwapsInfo = '';
    if (transactionClassification === 'swapClaim') {
      const txIdProto = new TransactionId({ inner: hexToUint8Array(txHash) });
      const tx = await fetchTransaction(
        txIdProto,
        'Could not fetch current transaction details for swapClaim:',
      );
      unfilledSwapsInfo = (await Array.fromAsync(unfilledSwaps(tx)))
        .map(x => {
          const formattedAmount = getFormattedAmtFromValueView(x);
          const metadata = getMetadataFromValueView.optional(x);
          const symbol = metadata?.symbol ?? 'Unknown asset';
          return `Unfilled: ${formattedAmount} ${symbol}`;
        })
        .join('. ');
    }

    toast.update({
      type: unfilledSwapsInfo.length ? 'warning' : 'success',
      message: `${label} transaction ${unfilledSwapsInfo.length ? 'partially succeded.' : 'succeeded! 🎉'}`,
      description:
        `Transaction ${shortenedTxHash} appeared on chain${detectionHeight ? ` at height ${detectionHeight}` : ''}. ${unfilledSwapsInfo}`.trim(),
      action: {
        label: <Link href={`/inspect/tx/${txHash}`}>See details</Link>,
        onClick: () => {},
      },
      dismissible: true,
      persistent: false,
    });

    return transaction;
  } catch (e) {
    console.error(e);
    if (userDeniedTransaction(e)) {
      toast.update({
        type: 'error',
        message: 'Transaction canceled',
        description: undefined,
        dismissible: true,
        persistent: false,
      });
    } else if (unauthenticated(e)) {
      toast.update({
        type: 'warning',
        message: 'Not logged in',
        description: 'Please log into the extension to continue.',
        dismissible: true,
        persistent: false,
      });
    } else {
      toast.update({
        type: 'error',
        message: 'Transaction failed',
        description: String(e),
        dismissible: true,
        persistent: false,
      });
    }
  }

  return undefined;
};
