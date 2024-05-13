import { SliceCreator } from '.';
import { viewClient } from '../clients';

export interface StatusSlice {
  start: () => Promise<void>;
  fullSyncHeight?: bigint;
  latestKnownBlockHeight?: bigint;
  error?: unknown;
}

export const createStatusSlice = (): SliceCreator<StatusSlice> => set => ({
  start: async () => {
    const stream = viewClient.statusStream({});

    try {
      for await (const result of stream) {
        set(state => {
          state.status.fullSyncHeight = result.fullSyncHeight;
          state.status.latestKnownBlockHeight = result.latestKnownBlockHeight;
        });
      }
    } catch (error) {
      set(state => {
        state.status.error = error;
      });
    }
  },
});
