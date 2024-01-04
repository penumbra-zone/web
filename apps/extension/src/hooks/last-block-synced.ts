import { useLoaderData } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TendermintQuerier } from '@penumbra-zone/query';
import { PopupLoaderData } from '../routes/popup/home';
import { useStore } from '../state';
import { networkSelector } from '../state/network';

// There is a slight delay with Zustand loading up the last block synced.
// To prevent the screen flicker, we use a loader to read it from chrome.storage.local.
const useLastBlockSynced = (): number => {
  const { lastBlockSynced: locallyStored } = useLoaderData() as PopupLoaderData;
  const { lastBlockSynced: inMemory } = useStore(networkSelector);
  return locallyStored > inMemory ? locallyStored : inMemory;
};

export const useSyncProgress = () => {
  const lastBlockSynced = useLastBlockSynced();
  const { grpcEndpoint } = useStore(networkSelector);

  // Wake up service worker so block syncing can resume
  useQuery({
    queryKey: ['sync-blocks', grpcEndpoint],
    queryFn: async () => {
      const syncing: boolean = await chrome.runtime.sendMessage('PENUMBRA_SYNC_BLOCKS');
      if (!syncing) throw new Error('Failed to sync blocks');
      return true; // react-query cannot return undefined
    },
  });

  const { data } = useQuery({
    queryKey: ['lastBlockHeight'],
    queryFn: async () => {
      const querier = new TendermintQuerier({ grpcEndpoint: grpcEndpoint! });
      return querier.latestBlockHeight();
    },
    enabled: Boolean(grpcEndpoint),
  });

  // If the syncing is ahead of our block-height query, use the sync value instead
  const lastBlockHeight = !data
    ? undefined
    : lastBlockSynced > Number(data)
      ? lastBlockSynced
      : Number(data);

  return { lastBlockHeight, lastBlockSynced };
};
