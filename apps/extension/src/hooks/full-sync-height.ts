import { useQuery } from '@tanstack/react-query';
import { TendermintQuerier } from '@penumbra-zone/query/src/queriers/tendermint';
import { PopupLoaderData } from '../routes/popup/home';
import { useStore } from '../state';
import { networkSelector } from '../state/network';
import { useLoaderData } from 'react-router-dom';

// There is a slight delay with Zustand loading up the last block synced.
// To prevent the screen flicker, we use a loader to read it from chrome.storage.local.
const useFullSyncHeight = (): number => {
  const { fullSyncHeight: locallyStored } = useLoaderData() as PopupLoaderData;
  const { fullSyncHeight: inMemory } = useStore(networkSelector);
  return locallyStored > inMemory ? locallyStored : inMemory;
};

export const useSyncProgress = () => {
  const fullSyncHeight = useFullSyncHeight();
  const { grpcEndpoint } = useStore(networkSelector);

  const { data, error } = useQuery({
    queryKey: ['latestBlockHeight'],
    queryFn: async () => {
      const querier = new TendermintQuerier({ grpcEndpoint: grpcEndpoint! });
      return querier.latestBlockHeight();
    },
    enabled: Boolean(grpcEndpoint),
  });

  // If the syncing is ahead of our block-height query, use the sync value instead
  const latestBlockHeight = !data
    ? undefined
    : fullSyncHeight > Number(data)
      ? fullSyncHeight
      : Number(data);

  return { latestBlockHeight, fullSyncHeight, error };
};
