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
      //set the current status using unary request, since statusStream does not guarantee that we will get the status
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
        console.error(error);
        state.status.error = error;
      });
    }
  },
});
