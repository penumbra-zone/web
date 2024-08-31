import { AbridgedZQueryState, ZQueryState } from '@penumbra-zone/zquery/src/types';
import { SliceCreator, useStore } from '.';
import { createZQuery } from '@penumbra-zone/zquery';
import { getStatusStream } from '../fetchers/status';

export interface Status {
  fullSyncHeight?: bigint;
  latestKnownBlockHeight?: bigint;
}

export const { status, useStatus } = createZQuery({
  name: 'status',
  fetch: getStatusStream,
  stream: () => ({
    onValue: (_prevState: Status | undefined, item: Status): Status => ({
      fullSyncHeight: item.fullSyncHeight,
      latestKnownBlockHeight: item.latestKnownBlockHeight,
    }),
  }),
  getUseStore: () => useStore,
  get: state => state.status.status,
  set: setter => {
    const newState = setter(useStore.getState().status.status);
    useStore.setState(state => {
      state.status.status = newState;
    });
  },
});

export interface StatusSlice {
  status: ZQueryState<{
    fullSyncHeight?: bigint;
    latestKnownBlockHeight?: bigint;
  }>;
}

export const createStatusSlice = (): SliceCreator<StatusSlice> => () => ({
  status,
});

// Copies the logic from the view service's `status` method.
export const statusSelector = (
  zQueryState: AbridgedZQueryState<Status>,
):
  | {
      /**
       * - `undefined` when not loaded
       * `true` if the sync is behind 10 blocks the current state of blockchain, or if not synced at all
       * `false` otherwise
       */
      isCatchingUp: undefined;
    }
  | {
      isCatchingUp: boolean;
      isUpdating: boolean;
      fullSyncHeight: bigint;
      latestKnownBlockHeight?: bigint;
      percentSynced?: string;
      percentSyncedNumber: number;
      error: unknown;
    } => {
  if (!zQueryState.data?.fullSyncHeight) {
    return { isCatchingUp: undefined };
  } else {
    const { fullSyncHeight, latestKnownBlockHeight } = zQueryState.data;
    const isCatchingUp = !latestKnownBlockHeight || latestKnownBlockHeight - fullSyncHeight > 10;
    const isUpdating = Boolean(
      latestKnownBlockHeight &&
        latestKnownBlockHeight !== fullSyncHeight &&
        latestKnownBlockHeight - fullSyncHeight <= 10,
    );

    let percentSyncedNumber = 0;
    if (latestKnownBlockHeight) {
      percentSyncedNumber = Number(fullSyncHeight) / Number(latestKnownBlockHeight);
      if (percentSyncedNumber > 1) {
        percentSyncedNumber = 1;
      }
    }

    return {
      error: zQueryState.error,
      isCatchingUp,
      isUpdating,
      fullSyncHeight,
      latestKnownBlockHeight,
      percentSyncedNumber,
      percentSynced: `${percentSyncedNumber * 100}%`,
    };
  }
};
