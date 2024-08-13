import {
  AuthorizeAndBuildRequest,
  AuthorizeAndBuildResponse,
  BalancesResponse,
  BroadcastTransactionRequest,
  BroadcastTransactionResponse,
  TransactionPlannerRequest,
  WitnessAndBuildRequest,
  WitnessAndBuildResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { ViewService } from '@penumbra-zone/protobuf';
import { sha256Hash } from '@penumbra-zone/crypto-web/sha256';
import {
  Transaction,
  TransactionPlan,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { TransactionId } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { TransactionToast } from '@repo/ui/lib/toast/transaction-toast';
import { TransactionClassification } from '@penumbra-zone/perspective/transaction/classification';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { fromValueView } from '@penumbra-zone/types/amount';
import { BigNumber } from 'bignumber.js';
import {
  getMetadataFromBalancesResponseOptional,
  getValueViewCaseFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { PromiseClient } from '@connectrpc/connect';
import { penumbra } from '../prax';

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

  const rpcMethod = options?.skipAuth
    ? penumbra.service(ViewService).witnessAndBuild
    : penumbra.service(ViewService).authorizeAndBuild;

  try {
    const transactionPlan = await plan(req);

    const transaction = await build({ transactionPlan }, rpcMethod, status =>
      toast.onBuildStatus(status),
    );

    const txHash = uint8ArrayToHex((await txSha256(transaction)).inner);
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
  const { plan } = await penumbra.service(ViewService).transactionPlanner(req);
  if (!plan) {
    throw new Error('No plan in planner response');
  }
  return plan;
};

const build = async (
  req: PartialMessage<AuthorizeAndBuildRequest> | PartialMessage<WitnessAndBuildRequest>,
  buildFn: PromiseClient<typeof ViewService>['authorizeAndBuild' | 'witnessAndBuild'],
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
  if (!transaction) {
    throw new Error('no transaction');
  }
  const txId = await txSha256(transaction);
  const txHash = uint8ArrayToHex(txId.inner);
  onStatusUpdate(undefined);
  for await (const { status } of penumbra.service(ViewService).broadcastTransaction({
    awaitDetection,
    transaction,
  })) {
    if (!txId.equals(status.value?.id)) {
      throw new Error('unexpected transaction id');
    }
    onStatusUpdate(status);
    switch (status.case) {
      case 'broadcastSuccess':
        if (!awaitDetection) {
          return { txHash, detectionHeight: undefined };
        }
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

const txSha256 = (tx: Transaction | PartialMessage<Transaction>) =>
  sha256Hash(tx instanceof Transaction ? tx.toBinary() : new Transaction(tx).toBinary()).then(
    inner => new TransactionId({ inner }),
  );

// We don't have ConnectError in this scope, so we only detect standard Error.
// Any ConnectError code is named at the beginning of the message value.

export const userDeniedTransaction = (e: unknown): boolean =>
  e instanceof Error && e.message.startsWith('[permission_denied]');

export const unauthenticated = (e: unknown): boolean =>
  e instanceof Error && e.message.startsWith('[unauthenticated]');

export const amountMoreThanBalance = (
  asset: BalancesResponse,
  /**
   * The amount that a user types into the interface will always be in the
   * display denomination -- e.g., in `penumbra`, not in `upenumbra`.
   */
  amountInDisplayDenom: string,
): boolean => {
  if (!asset.balanceView) {
    throw new Error('Missing balanceView');
  }

  const balanceAmt = fromValueView(asset.balanceView);
  return Boolean(amountInDisplayDenom) && BigNumber(amountInDisplayDenom).gt(balanceAmt);
};

/**
 * Checks if the entered amount fraction part is longer than the asset's exponent
 */
export const isIncorrectDecimal = (
  asset: BalancesResponse,
  /**
   * The amount that a user types into the interface will always be in the
   * display denomination -- e.g., in `penumbra`, not in `upenumbra`.
   */
  amountInDisplayDenom: string,
): boolean => {
  if (!asset.balanceView) {
    throw new Error('Missing balanceView');
  }

  const exponent = getDisplayDenomExponent.optional()(
    getMetadataFromBalancesResponseOptional(asset),
  );
  const fraction = amountInDisplayDenom.split('.')[1]?.length;
  return typeof exponent !== 'undefined' && typeof fraction !== 'undefined' && fraction > exponent;
};

export const isValidAmount = (amount: string, assetIn?: BalancesResponse) =>
  Number(amount) >= 0 &&
  (!assetIn || !amountMoreThanBalance(assetIn, amount)) &&
  (!assetIn || !isIncorrectDecimal(assetIn, amount));

export const isKnown = (balancesResponse: BalancesResponse) =>
  getValueViewCaseFromBalancesResponse.optional()(balancesResponse) === 'knownAssetId';
