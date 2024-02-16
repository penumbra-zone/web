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
      .message(`Building ${this.getLabel()} transaction`);
  }

  show(): this {
    this.toast.show();
    return this;
  }

  txHash(txHash?: string): this {
    this._txHash = txHash;
    return this;
  }

  onBuildStatus(status?: BuildStatus): this {
    this.toast
      .loading()
      .message(`Building ${this.getLabel()} transaction`)
      .description(getBuildingStatusDescription(status));

    return this;
  }

  onBroadcastStatus(status?: BroadcastStatus): this {
    this.toast
      .loading()
      .message(getBroadcastingStatusMessage(this.getLabel(), status))
      .description(this.shortenedTxHash);

    return this;
  }

  onSuccess(detectionHeight?: bigint): this {
    this.toast
      .success()
      .message(`${this.getLabel()} transaction succeeded! 🎉`)
      .description(
        `Transaction ${this.shortenedTxHash} appeared on chain ${detectionHeight ? `at height ${detectionHeight}` : ''}`,
      )
      .closeButton();

    return this;
  }

  onFailure(error: unknown): this {
    this.toast
      .error()
      .message(`${this.getLabel()} transaction failed`)
      .description(String(error))
      .closeButton();

    return this;
  }

  onDenied(): this {
    this.toast.info().message('Transaction canceled').description(undefined).duration(5_000);

    return this;
  }

  private getLabel(): string {
    return TRANSACTION_LABEL_BY_CLASSIFICATION[this.transactionClassification];
  }

  private get shortenedTxHash(): string {
    return this._txHash ? shorten(this._txHash, 8) : '';
  }
}
