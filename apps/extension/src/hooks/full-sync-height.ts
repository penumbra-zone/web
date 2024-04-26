import { useQuery } from '@tanstack/react-query';
import { TendermintQuerier } from '@penumbra-zone/query/queriers/tendermint';
import { PopupLoaderData } from '../routes/popup/home';
import { useStore } from '../state';
import { networkSelector } from '../state/network';
import { useLoaderData } from 'react-router-dom';

const tryGetMax = (a?: number, b?: number): number | undefined => {
  // Height can be 0n which is falsy, so should compare to undefined state
  if (a === undefined) return b;
  if (b === undefined) return a;

  return Math.max(a, b);
};

// There is a slight delay with Zustand loading up the last block synced.
// To prevent the screen flicker, we use a loader to read it from chrome.storage.local.
const useFullSyncHeight = (): number | undefined => {
  const { fullSyncHeight: localHeight } = useLoaderData() as PopupLoaderData;
  const { fullSyncHeight: memoryHeight } = useStore(networkSelector);

  return tryGetMax(localHeight, memoryHeight);
};

export const useSyncProgress = () => {
  const fullSyncHeight = useFullSyncHeight();
  const { grpcEndpoint } = useStore(networkSelector);

  const { data: queriedLatest, error } = useQuery({
    queryKey: ['latestBlockHeight'],
    queryFn: async () => {
      const querier = new TendermintQuerier({ grpcEndpoint: grpcEndpoint! });
      const blockHeight = await querier.latestBlockHeight();
      return Number(blockHeight);
    },
    enabled: Boolean(grpcEndpoint),
  });

  // If we have a queried sync height and it's ahead of our block-height query,
  // use the sync value instead
  const latestBlockHeight = queriedLatest ? tryGetMax(queriedLatest, fullSyncHeight) : undefined;

  return { latestBlockHeight, fullSyncHeight, error };
};
