/**
 * This migration is a special case, as it may migrate to V1 or V2.  It migrates
 * from individually-versioned items to a global verison. It may migrate to V1
 * or V2.
 *
 * 1. Check that the storageVersion does not exist
 * 2. Check that the storage items are versioned
 * 4. Transition each key-(value, version) pair to a bare key-value
 * 3. Provisionally assume storageVersion=1
 * 5. CHECK IF ALREADY V2 FORMAT: storageVersion=2 ONLY IF wallets version is V2
 */

// individually-versioned items
interface V0Item<T = unknown> {
  version: string;
  value: T;
}

// stub key-value schema, containing all expected keys
type V0Storage = Partial<{
  wallets: V0Item;
  grpcEndpoint?: V0Item;
  frontendUrl: V0Item;
  passwordKeyPrint?: V0Item;
  fullSyncHeight?: V0Item;
  knownSites: V0Item;
}>;

const isV0Item = (data: unknown): data is V0Item =>
  typeof data === 'object' && data !== null && 'version' in data && 'value' in data;

const isOptionalV0Item = (data: unknown): data is undefined | V0Item =>
  data == null || isV0Item(data);

const isV0Storage = (data: unknown): data is Partial<V0Storage> =>
  typeof data === 'object' && data !== null && Object.values(data).every(isOptionalV0Item);

export const migrate = async () => {
  console.log('migration 0_1');

  const allData = await chrome.storage.local.get();

  // there should be no storageVersion in the first migration
  if ('storageVersion' in allData)
    throw new Error('storageVersion should not exist in the first migration');

  if (!isV0Storage(allData)) throw new Error('unexpected storage schema');

  const migrated = Object.fromEntries(
    Object.entries(allData).map(([key, { value }]) => [key, value]),
  );

  let storageVersion: number | undefined;
  switch (allData.wallets?.version) {
    case 'V1':
      storageVersion = 1;
      break;
    case 'V2':
      storageVersion = 2;
      break;
    default:
      throw new Error('unknown wallet version');
  }

  await chrome.storage.local.set({
    // fix missing grpcEndpoint
    grpcEndpoint: String(new URL(DEFAULT_FULLNODE_URL)),
    ...migrated,
    storageVersion,
  });
};
