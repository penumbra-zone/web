import { localExtStorage } from './local';
import { IndexedDb } from '../indexed-db';

// Syncs the IndexedDb last block number with chrome.storage.local
// Later used to synchronize with Zustand store
export const syncLastBlockWithLocal = async (indexedDb: IndexedDb) => {
  const fullSyncHeightDb = await indexedDb.getfullSyncHeight();
  await localExtStorage.set('fullSyncHeight', Number(fullSyncHeightDb));

  const subscription = indexedDb.subscribe('LAST_BLOCK_SYNCED');
  for await (const update of subscription) {
    await localExtStorage.set('fullSyncHeight', Number(update.value));
  }
};
