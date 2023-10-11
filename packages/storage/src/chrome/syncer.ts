import { IdbUpdateNotifier } from '../indexed-db/updater';
import { localExtStorage } from './local';
import { PenumbraDb } from 'penumbra-types';

// Syncs the IndexedDb last block number with chrome.storage.local
// Later used to synchronize with Zustand store
export const syncLastBlockWithLocal = (): IdbUpdateNotifier<PenumbraDb, 'LAST_BLOCK_SYNCED'> => {
  return {
    table: 'LAST_BLOCK_SYNCED',
    handler: async val => {
      // Local storage does not support bigInt's
      await localExtStorage.set('lastBlockSynced', Number(val));
    },
  };
};
