export interface BlockSyncProps {
  latestKnownBlockHeight?: number;
  fullSyncHeight?: number;
  error?: unknown;
}

export interface SyncingStateProps {
  latestKnownBlockHeight: number;
  fullSyncHeight: number;
}
