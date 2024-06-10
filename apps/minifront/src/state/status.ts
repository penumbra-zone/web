import { ZQueryState } from '@penumbra-zone/zquery/src/types';
import { SliceCreator, useStore } from '.';
import { createZQuery } from '@penumbra-zone/zquery';
import { getStatusStream } from '../fetchers/status';

interface Status {
  fullSyncHeight?: bigint;
  latestKnownBlockHeight?: bigint;
}

export const { status, useStatus } = createZQuery({
  name: 'status',
  fetch: ({ abortSignal }) => getStatusStream(abortSignal),
  stream: (_prevState: Status | undefined, item: Status): Status => ({
    fullSyncHeight: item.fullSyncHeight,
    latestKnownBlockHeight: item.latestKnownBlockHeight,
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
