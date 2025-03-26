import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { ViewService } from '@penumbra-zone/protobuf';
import { Transaction } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { openToast } from '@penumbra-zone/ui/Toast';
import { TransactionClassification } from '@penumbra-zone/perspective/transaction/classification';
import { TRANSACTION_LABEL_BY_CLASSIFICATION } from '@penumbra-zone/perspective/transaction/classify';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { penumbra } from '@/shared/const/penumbra';
import { shorten } from '@penumbra-zone/types/string';

import { txToId } from '../model/tx-to-id';
import { getBroadcastStatusMessage, getBuildStatusDescription } from '../model/status';
import { userDeniedTransaction, unauthenticated } from '../model/validations';
import { planTransaction } from './plan';
import { broadcastTransaction } from './broadcast';
import { buildTransaction } from './build';

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

    toast.update({
      type: 'success',
      message: `${label} transaction succeeded! 🎉`,
      description: `Transaction ${shortenedTxHash} appeared on chain${detectionHeight ? ` at height ${detectionHeight}` : ''}.`,
      // action: <Link to={`/tx/${this._txHash}`}>See details</Link>
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
