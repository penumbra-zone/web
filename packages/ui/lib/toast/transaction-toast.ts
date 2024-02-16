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

type BroadcastStatus = BroadcastTransactionResponse['status'];
type BuildStatus = (AuthorizeAndBuildResponse | WitnessAndBuildResponse)['status'];

const getBroadcastingStatusMessage = (label: string, status?: BroadcastStatus) => {
  if (status?.case === 'broadcastSuccess' || status?.case === 'confirmed')
    return 'Waiting for confirmation';
  return `Emitting ${label} transaction`;
};

const getBuildingStatusDescription = (
  status?: Exclude<BuildStatus, undefined>,
): string | undefined => {
  if (status?.case === 'buildProgress') return `${Math.round(status.value.progress * 100)}%`;
  if (status?.case === 'complete') return '100%';
  return undefined;
};

export class TransactionToast {
  private toast: Toast;
  private _txHash?: string;

  constructor(private transactionClassification: TransactionClassification) {
    this.toast = new Toast()
      .duration(Infinity)
      .loading()
      .message(`Building ${this.label} transaction`);
  }

  txHash(txHash?: string): void {
    this._txHash = txHash;
  }

  onStart(): void {
    this.toast.show();
  }

  onBuildStatus(status?: BuildStatus): void {
    this.toast
      .loading()
      .message(`Building ${this.label} transaction`)
      .description(getBuildingStatusDescription(status))
      .show();
  }

  onBroadcastStatus(status?: BroadcastStatus): void {
    this.toast
      .loading()
      .message(getBroadcastingStatusMessage(this.label, status))
      .description(this.shortenedTxHash)
      .show();
  }

  onSuccess(detectionHeight?: bigint): void {
    this.toast
      .success()
      .message(`${this.label} transaction succeeded! 🎉`)
      .description(
        `Transaction ${this.shortenedTxHash} appeared on chain ${detectionHeight ? `at height ${detectionHeight}` : ''}`,
      )
      .closeButton()
      .show();
  }

  onFailure(error: unknown): void {
    this.toast
      .error()
      .message(`${this.label} transaction failed`)
      .description(String(error))
      .closeButton()
      .show();
  }

  onDenied(): void {
    this.toast.info().message('Transaction canceled').description(undefined).duration(5_000).show();
  }

  private get label(): string {
    return TRANSACTION_LABEL_BY_CLASSIFICATION[this.transactionClassification];
  }

  private get shortenedTxHash(): string {
    return this._txHash ? shorten(this._txHash, 8) : '';
  }
}
