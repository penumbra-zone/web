import { ChainRegistryClient } from '@penumbra-labs/registry';
import { useQuery } from '@tanstack/react-query';
import { envQueryFn } from './env/env';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getAssetMetadataById } from './metadata';

export const chainRegistryClient = new ChainRegistryClient();

export const registryQueryFn = async () => {
  const env = await envQueryFn();
  return chainRegistryClient.remote.get(env.PENUMBRA_CHAIN_ID);
};

export const useStakingTokenMetadata = () => {
  return useQuery({
    queryKey: ['stakingTokenMetadata'],
    queryFn: async (): Promise<Metadata> => {
      const { stakingAssetId } = chainRegistryClient.bundled.globals();
      const stakingAssetsMetadata = await getAssetMetadataById(stakingAssetId);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- staking token exists in registry
      return stakingAssetsMetadata!;
    },
    staleTime: Infinity,
  });
};

export const useRegistryAssets = () => {
  return useQuery({
    queryKey: ['penumbraRegistryAssets'],
    queryFn: async (): Promise<Metadata[]> => {
      const registry = await registryQueryFn();
      return registry
        .getAllAssets()
        .sort((a, b) => Number(b.priorityScore) - Number(a.priorityScore));
    },
    staleTime: Infinity,
  });
};

export const useRegistry = () => {
  return useQuery({
    queryKey: ['penumbraRegistry'],
    queryFn: registryQueryFn,
    staleTime: Infinity,
  });
};
