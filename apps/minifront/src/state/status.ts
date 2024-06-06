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
  fetch: getStatusStream,
  stream: (_prevState: Status | undefined, item: Status): Status => ({
    fullSyncHeight: item.fullSyncHeight,
    latestKnownBlockHeight: item.latestKnownBlockHeight,
  }),
  getUseStore: () => useStore,
  get: state => state.status.status,
  set: newValue =>
    useStore.setState(state => {
      state.status.status = newValue;
    }),
});

export interface StatusSlice {
  status: ZQueryState<{
    fullSyncHeight?: bigint;
    latestKnownBlockHeight?: bigint;
    error?: unknown;
  }>;
}

export const createStatusSlice = (): SliceCreator<StatusSlice> => () => ({
  status,
});
