export const fullSyncHeight = async (set?: bigint): Promise<bigint> => {
  if (set != null) await chrome.storage.local.set({ fullSyncHeight: String(set) });

  const { fullSyncHeight } = await chrome.storage.local.get('fullSyncHeight');
  if (typeof fullSyncHeight === 'string') return BigInt(fullSyncHeight);

  throw new TypeError();
};
