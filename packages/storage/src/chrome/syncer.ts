import { localExtStorage } from './local';
import { IndexedDb } from '../indexed-db';

// Syncs the IndexedDb last block number with chrome.storage.local
// Later used to synchronize with Zustand store
export const syncLastBlockWithLocal = async (indexedDb: IndexedDb) => {
  const subscription = indexedDb.subscribe('LAST_BLOCK_SYNCED');
  for await (const update of subscription) {
    await localExtStorage.set('lastBlockSynced', Number(update.value));
  }
};
