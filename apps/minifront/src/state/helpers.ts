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
import { sha256Hash } from '@penumbra-zone/crypto-web/sha256';
import {
  Transaction,
  TransactionPlan,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { TransactionToast } from '@penumbra-zone/ui/lib/toast/transaction-toast';
import { TransactionClassification } from '@penumbra-zone/perspective/transaction/classification';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';

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

  const rpcMethod = options?.skipAuth ? viewClient.witnessAndBuild : viewClient.authorizeAndBuild;

  try {
    const transactionPlan = await plan(req);

    const transaction = await build({ transactionPlan }, rpcMethod, status =>
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
    } else if (unauthenticated(e)) {
      toast.onUnauthenticated();
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
  buildFn: (typeof viewClient)['authorizeAndBuild' | 'witnessAndBuild'],
  onStatusUpdate: (
    status?: (AuthorizeAndBuildResponse | WitnessAndBuildResponse)['status'],
  ) => void,
) => {
  for await (const { status } of buildFn(req)) {
    onStatusUpdate(status);

    switch (status.case) {
      case undefined:
      case 'buildProgress':
        break;
      case 'complete':
        return status.value.transaction!;
      default:
        console.warn(`unknown ${buildFn.name} status`, status);
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

// We don't have ConnectError in this scope, so we only detect standard Error.
// Any ConnectError code is named at the beginning of the message value.

export const userDeniedTransaction = (e: unknown): boolean =>
  e instanceof Error && e.message.startsWith('[permission_denied]');

export const unauthenticated = (e: unknown): boolean =>
  e instanceof Error && e.message.startsWith('[unauthenticated]');
