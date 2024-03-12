import {
  AuthorizeAndBuildRequest,
  AuthorizeAndBuildResponse,
  BroadcastTransactionRequest,
  BroadcastTransactionResponse,
  TransactionPlannerRequest,
  WitnessAndBuildRequest,
  WitnessAndBuildResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { viewClient } from '../clients';
import { TransactionClassification, uint8ArrayToHex } from '@penumbra-zone/types';
import { sha256Hash } from '@penumbra-zone/crypto-web';
import {
  Transaction,
  TransactionPlan,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import { TransactionToast } from '@penumbra-zone/ui';

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
  const toast = new TransactionToast(transactionClassification);
  toast.onStart();

  try {
    const transactionPlan = await plan(req);

    const transaction = await build({ transactionPlan }, !!options?.skipAuth, status =>
      toast.onBuildStatus(status),
    );

    const txHash = await getTxHash(transaction);
    toast.txHash(txHash);

    const { detectionHeight } = await broadcast({ transaction, awaitDetection: true }, status =>
      toast.onBroadcastStatus(status),
    );
    toast.onSuccess(detectionHeight);

    return transaction;
  } catch (e) {
    if (userDeniedTransaction(e)) {
      toast.onDenied();
    } else {
      toast.onFailure(e);
      throw e;
    }
  }

  return undefined;
};

export const plan = async (
  req: PartialMessage<TransactionPlannerRequest>,
): Promise<TransactionPlan> => {
  const { plan } = await viewClient.transactionPlanner(req);
  if (!plan) throw new Error('No plan in planner response');
  return plan;
};

const build = async (
  req: PartialMessage<AuthorizeAndBuildRequest> | PartialMessage<WitnessAndBuildRequest>,
  skipAuth: boolean,
  onStatusUpdate: (
    status?: (AuthorizeAndBuildResponse | WitnessAndBuildResponse)['status'],
  ) => void,
) => {
  const buildFn = skipAuth ? 'witnessAndBuild' : 'authorizeAndBuild';

  for await (const { status } of viewClient[buildFn](req)) {
    onStatusUpdate(status);

    switch (status.case) {
      case undefined:
      case 'buildProgress':
        break;
      case 'complete':
        return status.value.transaction!;
      default:
        console.warn(`unknown ${buildFn} status`, status);
    }
  }
  throw new Error('did not build transaction');
};

const broadcast = async (
  req: PartialMessage<BroadcastTransactionRequest>,
  onStatusUpdate: (status?: BroadcastTransactionResponse['status']) => void,
): Promise<{ txHash: string; detectionHeight?: bigint }> => {
  const { awaitDetection, transaction } = req;
  if (!transaction) throw new Error('no transaction');
  const txId = await getTxId(transaction);
  const txHash = getTxHash(txId);
  onStatusUpdate(undefined);
  for await (const { status } of viewClient.broadcastTransaction({ awaitDetection, transaction })) {
    if (!txId.equals(status.value?.id)) throw new Error('unexpected transaction id');
    onStatusUpdate(status);
    switch (status.case) {
      case 'broadcastSuccess':
        if (!awaitDetection) return { txHash, detectionHeight: undefined };
        break;
      case 'confirmed':
        return { txHash, detectionHeight: status.value.detectionHeight };
      default:
        console.warn(`unknown broadcastTransaction status: ${status.case}`);
    }
  }
  // TODO: detail broadcastSuccess status
  throw new Error('did not broadcast transaction');
};

const getTxHash = <T extends Required<PartialMessage<TransactionId>> | PartialMessage<Transaction>>(
  t: T,
): T extends Required<PartialMessage<TransactionId>> ? string : Promise<string> =>
  'inner' in t && t.inner instanceof Uint8Array
    ? (uint8ArrayToHex(t.inner) as T extends Required<PartialMessage<TransactionId>>
        ? string
        : never)
    : (getTxId(t as PartialMessage<Transaction>).then(({ inner }) =>
        uint8ArrayToHex(inner),
      ) as T extends Required<PartialMessage<TransactionId>> ? never : Promise<string>);

const getTxId = (tx: Transaction | PartialMessage<Transaction>) =>
  sha256Hash(tx instanceof Transaction ? tx.toBinary() : new Transaction(tx).toBinary()).then(
    inner => new TransactionId({ inner }),
  );

/**
 * @todo: The error flow between extension <-> webapp needs to be refactored a
 * bit. Right now, if we throw a `ConnectError` with `Code.PermissionDenied` (as
 * we do in the approver), it gets swallowed by ConnectRPC's internals and
 * rethrown via `ConnectError.from()`.  This means that the original code is
 * lost, although the stringified error message still contains
 * `[permission_denied]`. So we'll (somewhat hackily) check the stringified
 * error message for now; but in the future, we need ot get the error flow
 * working properly so that we can actually check `e.code ===
 * Code.PermissionDenied`.
 */
export const userDeniedTransaction = (e: unknown): boolean =>
  e instanceof ConnectError && e.message.includes('[permission_denied]');
