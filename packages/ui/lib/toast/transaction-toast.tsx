import {
  TRANSACTION_LABEL_BY_CLASSIFICATION,
  TransactionClassification,
  shorten,
} from '@penumbra-zone/types';
import { Toast } from './toast';
import {
  AuthorizeAndBuildResponse,
  BroadcastTransactionResponse,
  WitnessAndBuildResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Link } from 'react-router-dom';
import { Progress } from '../../components/ui/progress';
import { ReactNode } from 'react';

type BroadcastStatus = BroadcastTransactionResponse['status'];
type BuildStatus = (AuthorizeAndBuildResponse | WitnessAndBuildResponse)['status'];

const getBroadcastStatusMessage = (label: string, status?: BroadcastStatus) => {
  if (status?.case === 'broadcastSuccess' || status?.case === 'confirmed')
    return 'Waiting for confirmation';
  return `Emitting ${label} transaction`;
};

const getBuildStatusDescription = (
  status?: Exclude<BuildStatus, undefined>,
): ReactNode | undefined => {
  if (status?.case === 'buildProgress')
    return (
      <Progress
        variant='in-progress'
        value={Math.round(status.value.progress * 100)}
        size='sm'
        className='mt-2'
      />
    );
  if (status?.case === 'complete')
    return <Progress variant='done' value={100} size='sm' className='mt-2' />;
  return undefined;
};

/**
 * Manages the lifecycle of a toast for a transaction through the stages of
 * authorizing, building, and broadcasting.
 */
export class TransactionToast {
  private toast: Toast;
  private _txHash?: string;

  constructor(private transactionClassification: TransactionClassification) {
    this.toast = new Toast()
      .duration(Infinity)
      .loading()
      .message(`Building ${this.label} transaction`);
  }

  /**
   * Stores the transaction hash so that it can be used in the success and
   * (optionally) broadcast stages. This _must_ be called before calling
   * `.onSuccess()`, as the hash is needed for rendering the link to the
   * transaction. If possible, also call it before calling
   * `.onBroadcastStatus()`, so that the hash can be included in the toast while
   * broadcasting.
   */
  txHash(txHash: string): void {
    this._txHash = txHash;
  }

  /**
   * Shows the toast to the user with a loading indicator.
   */
  onStart(): void {
    this.toast.render();
  }

  /**
   * Updates the toast to show the build's progress. Call this with the `status`
   * that comes back from `viewClient.authorizeAndBuild` or
   * `viewClient.witnessAndBuild`.
   *
   * @example
   * ```
   * const tx = await authWitnessBuild({ transactionPlan }, status =>
   *   toast.onBuildStatus(status),
   * );
   * ```
   */
  onBuildStatus(status?: BuildStatus): void {
    this.toast
      .loading()
      .message(`Building ${this.label} transaction`)
      .description(getBuildStatusDescription(status))
      .render();
  }

  /**
   * Updates the toast to show the broadcast status. Call this with the `status`
   * that comes back from `viewClient.broadcastTransaction`.
   *
   * @example
   * ```
   * await broadcast({ transaction }, status =>
   *   toast.onBroadcastStatus(status),
   * );
   * ```
   */
  onBroadcastStatus(status?: BroadcastStatus): void {
    this.toast
      .loading()
      .message(getBroadcastStatusMessage(this.label, status))
      .description(this.shortenedTxHash)
      .render();
  }

  /**
   * Updates the toast to show that a transaction succeeded. Note that you must
   * call `.txHash()` before calling `.onSuccess()`, so that `.onSuccess()` can
   * render a link to the transaction.
   */
  onSuccess(
    /**
     * Optional. If passed, will indicate to the user what block height the
     * transaction was detected at.
     */
    detectionHeight?: bigint,
  ): void {
    if (!this._txHash)
      throw new Error(
        'You called TransactionToast.onSuccess() without first calling `TransactionToast.txHash()`. You must first call `TransactionToast.txHash()` with the transaction hash, so that the success toast can construct a link to the transaction.',
      );

    this.toast
      .success()
      .message(`${this.label} transaction succeeded! 🎉`)
      .description(
        `Transaction ${this.shortenedTxHash} appeared on chain${detectionHeight ? ` at height ${detectionHeight}` : ''}.`,
      )
      .action(<Link to={`/tx/${this._txHash}`}>See details</Link>)
      .closeButton()
      .render();
  }

  /**
   * Updates the toast to show that a transaction failed. Pass it any relevant
   * error, which will be stringified in the toast.
   */
  onFailure(error: unknown): void {
    this.toast
      .error()
      .message(`${this.label} transaction failed`)
      .description(String(error))
      .closeButton()
      .render();
  }

  /**
   * Updates the toast to show that the user denied the transaction.
   */
  onDenied(): void {
    this.toast
      .info()
      .message('Transaction canceled')
      .description(undefined)
      .duration(5_000)
      .render();
  }

  private get label(): string {
    return TRANSACTION_LABEL_BY_CLASSIFICATION[this.transactionClassification];
  }

  private get shortenedTxHash(): string {
    return this._txHash ? shorten(this._txHash, 8) : '';
  }
}
