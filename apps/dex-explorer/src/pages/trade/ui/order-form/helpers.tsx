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
import { openToast } from '@penumbra-zone/ui/Toast';
import { Progress } from '@penumbra-zone/ui/Progress';
import { TransactionClassification } from '@penumbra-zone/perspective/transaction/classification';
import { TRANSACTION_LABEL_BY_CLASSIFICATION } from '@penumbra-zone/perspective/transaction/classify';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { fromValueView } from '@penumbra-zone/types/amount';
import { BigNumber } from 'bignumber.js';
import {
  getMetadataFromBalancesResponse,
  getValueViewCaseFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { PromiseClient } from '@connectrpc/connect';
import { penumbra } from '@/shared/const/penumbra';
import { ReactNode } from 'react';
import { shorten } from '@penumbra-zone/types/string';
import { updatePositionsQuery } from '../../api/positions';

type BroadcastStatus = BroadcastTransactionResponse['status'];
type BuildStatus = (AuthorizeAndBuildResponse | WitnessAndBuildResponse)['status'];

const getBroadcastStatusMessage = (label: string, status?: BroadcastStatus) => {
  if (status?.case === 'broadcastSuccess' || status?.case === 'confirmed') {
    return 'Waiting for confirmation';
  }
  return `Emitting ${label} transaction`;
};

const getBuildStatusDescription = (
  status?: Exclude<BuildStatus, undefined>,
): ReactNode | undefined => {
  if (status?.case === 'buildProgress') {
    return (
      <div className='mt-2'>
        <Progress value={status.value.progress} />
      </div>
    );
  }

  if (status?.case === 'complete') {
    return (
      <div className='mt-2'>
        <Progress value={1} />
      </div>
    );
  }
  return undefined;
};

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
    const transactionPlan = await plan(req);

    const transaction = await build({ transactionPlan }, rpcMethod, status => {
      toast.update({
        description: getBuildStatusDescription(status),
      });
    });

    const txHash = uint8ArrayToHex((await txSha256(transaction)).inner);
    const shortenedTxHash = shorten(txHash, 8);

    const { detectionHeight } = await broadcast({ transaction, awaitDetection: true }, status =>
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

    await updatePositionsQuery();

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
  // Setting timeout for 10mins given slower machines can take time to build
  for await (const { status } of buildFn(req, { timeoutMs: 600_000 })) {
    onStatusUpdate(status);

    switch (status.case) {
      case undefined:
      case 'buildProgress':
        break;
      case 'complete':
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: justify
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

  const exponent = getDisplayDenomExponent.optional(
    getMetadataFromBalancesResponse.optional(asset),
  );
  const fraction = amountInDisplayDenom.split('.')[1]?.length;
  return typeof exponent !== 'undefined' && typeof fraction !== 'undefined' && fraction > exponent;
};

export const isValidAmount = (amount: string, assetIn?: BalancesResponse) =>
  Number(amount) >= 0 &&
  (!assetIn || !amountMoreThanBalance(assetIn, amount)) &&
  (!assetIn || !isIncorrectDecimal(assetIn, amount));

export const isKnown = (balancesResponse: BalancesResponse) =>
  getValueViewCaseFromBalancesResponse.optional(balancesResponse) === 'knownAssetId';
