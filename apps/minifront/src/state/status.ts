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
    try {
      // statusStream sends new data to stream only when a new block is detected.
      // This can take up to 5 seconds (time of new block generated).
      // Therefore, we need to do a unary request to start us off.
      const status = await viewClient.status({});
      set(state => {
        state.status.fullSyncHeight = status.fullSyncHeight;
        if (!status.catchingUp) state.status.latestKnownBlockHeight = status.fullSyncHeight;
      });

      const stream = viewClient.statusStream({});
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
