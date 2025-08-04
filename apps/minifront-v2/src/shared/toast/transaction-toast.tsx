import { openToast, Toast } from '@penumbra-zone/ui/Toast';
import { ReactNode } from 'react';
import { TransactionClassification } from '@penumbra-zone/perspective/transaction/classification';
import { TRANSACTION_LABEL_BY_CLASSIFICATION } from '@penumbra-zone/perspective/transaction/classify';
import { shorten } from '@penumbra-zone/types/string';

import { Progress } from '@penumbra-zone/ui/Progress';

type BroadcastStatus = {
  case?: 'broadcastSuccess' | 'confirmed';
  value?: any;
};

type BuildStatus = {
  case?: 'buildProgress' | 'complete';
  value?: {
    progress?: number;
    transaction?: any;
  };
};

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
        <Progress value={status.value?.progress ?? 0} loading />
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
 * Manages the lifecycle of a toast for a transaction through the stages of
 * authorizing, building, and broadcasting.
 */
export class TransactionToast {
  private toastRef?: Toast;
  private _txHash?: string;

  constructor(private transactionClassification: TransactionClassification) {}

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
    this.toastRef = openToast({
      type: 'loading',
      message: `Building ${this.label} transaction`,
      persistent: true,
    });
  }

  /**
   * Updates the toast to show the build's progress. Call this with the `status`
   * that comes back from `viewClient.authorizeAndBuild` or
   * `viewClient.witnessAndBuild`.
   */
  onBuildStatus(status?: BuildStatus): void {
    this.toastRef?.update({
      type: 'loading',
      message: `Building ${this.label} transaction`,
      description: getBuildStatusDescription(status),
    });
  }

  /**
   * Updates the toast to show the broadcast status. Call this with the `status`
   * that comes back from `viewClient.broadcastTransaction`.
   */
  onBroadcastStatus(status?: BroadcastStatus): void {
    this.toastRef?.update({
      type: 'loading',
      message: getBroadcastStatusMessage(this.label, status),
      description: this.shortenedTxHash,
    });
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
    if (!this._txHash) {
      throw new Error(
        'You called TransactionToast.onSuccess() without first calling `TransactionToast.txHash()`. You must first call `TransactionToast.txHash()` with the transaction hash, so that the success toast can construct a link to the transaction.',
      );
    }

    this.toastRef?.update({
      type: 'success',
      message: `${this.label} transaction succeeded! 🎉`,
      description: `Transaction ${this.shortenedTxHash} appeared on chain${detectionHeight ? ` at height ${detectionHeight}` : ''}.`,
      action: {
        label: 'See details',
        onClick: () => {
          window.location.href = `#/portfolio/transactions?tx=${this._txHash}`;
        },
      },
      dismissible: true,
      persistent: true,
    });
  }

  /**
   * Updates the toast to show that a transaction failed. Pass it any relevant
   * error, which will be stringified in the toast.
   */
  onFailure(error: unknown): void {
    console.error(error);
    this.toastRef?.update({
      type: 'error',
      message: `${this.label} transaction failed`,
      description: String(error),
      dismissible: true,
      persistent: true,
    });
  }

  onUnauthenticated(): void {
    this.toastRef?.update({
      type: 'warning',
      message: 'Not logged in',
      description: 'Please log into the extension to continue.',
      persistent: false,
    });
  }

  /**
   * Updates the toast to show that the user denied the transaction, or closed
   * the approval popup without approving.
   */
  onDenied(): void {
    this.toastRef?.update({
      type: 'info',
      message: 'Transaction canceled',
      description: undefined,
      persistent: false,
    });
  }

  private get label(): string {
    return TRANSACTION_LABEL_BY_CLASSIFICATION[this.transactionClassification];
  }

  private get shortenedTxHash(): string {
    return this._txHash ? shorten(this._txHash, 8) : '';
  }
}
