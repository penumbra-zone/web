import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/penumbra';
import { getSyncPercent } from '@/shared/state/status/getSyncPercent';
import { makeAutoObservable, runInAction, when } from 'mobx';
import {
  StatusResponse,
  StatusStreamResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { connectionStore } from '@/shared/state/connection';

class StatusState {
  /** If true, ignore all other state values */
  loading = true;
  /** The error is set in case of a request failure */
  error?: string;
  /** Indicates that the account needs syncing with the blockchain */
  syncing = false;
  /** Indicates that the account is almost in sync with the blockchain (amount of unsynced blocks is less than 10) */
  updating?: boolean = false;
  /** The amount of synced blocks */
  fullSyncHeight = 0n;
  /** The total amount of blocks in the blockchain */
  latestKnownBlockHeight?: bigint;
  /** A number between 0 and 1 indicating the sync progress */
  syncPercent = 0;
  /** A stringified sync percentage, e.g. '100%' or '17%' */
  syncPercentStringified = '0%';

  constructor() {
    makeAutoObservable(this);

    when(
      () => connectionStore.connected,
      () => void this.setup(),
    );
  }

  async setup() {
    try {
      const status = await penumbra.service(ViewService).status({});
      this.setUnaryStatus(status);

      const stream = penumbra.service(ViewService).statusStream({});
      for await (const status of stream) {
        this.setStreamedStatus(status);
      }
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? `${error.name}: ${error.message}` : 'Streaming error';
      });
      setTimeout(() => void this.setup(), 1000);
    }
  }

  setUnaryStatus(status: StatusResponse) {
    this.loading = false;
    this.error = undefined;
    this.syncing = status.catchingUp;
    this.fullSyncHeight = status.fullSyncHeight;
    this.latestKnownBlockHeight = status.catchingUp ? undefined : status.fullSyncHeight;
    this.syncPercent = status.catchingUp ? 0 : 1;
    this.syncPercentStringified = status.catchingUp ? '0%' : '100%';
  }

  setStreamedStatus(status: StatusStreamResponse) {
    this.loading = false;
    this.error = undefined;
    this.syncing = status.fullSyncHeight !== status.latestKnownBlockHeight;
    this.fullSyncHeight = status.fullSyncHeight;
    this.latestKnownBlockHeight = status.latestKnownBlockHeight;
    const { syncPercent, syncPercentStringified } = getSyncPercent(
      status.fullSyncHeight,
      status.latestKnownBlockHeight,
    );
    this.syncPercent = syncPercent;
    this.syncPercentStringified = syncPercentStringified;
  }
}

export const statusStore = new StatusState();
