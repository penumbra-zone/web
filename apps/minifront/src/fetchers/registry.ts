import { ChainRegistryClient, Registry } from '@penumbra-labs/registry';
import { useQuery } from '@tanstack/react-query';
import { getChainId } from './chain-id';
import { getAssetMetadataById } from './assets';

const chainRegistryClient = new ChainRegistryClient();

export const useRegistry = () => {
  return useQuery({
    queryKey: ['penumbraRegistry'],
    queryFn: async (): Promise<Registry> => {
      const chainId = await getChainId();
      if (!chainId) throw new Error('No chain id in response');
      return chainRegistryClient.get(chainId);
    },
    staleTime: Infinity,
  });
};

export const getStakingTokenMetadata = async () => {
  const chainId = await getChainId();
  if (!chainId) {
    throw new Error('Could not fetch chain id');
  }

  const { stakingAssetId } = await chainRegistryClient.get(chainId);
  const stakingAssetsMetadata = await getAssetMetadataById(stakingAssetId);

  if (!stakingAssetsMetadata) {
    throw new Error('Could not fetch staking asset metadata');
  }
  return stakingAssetsMetadata;
};

export const getIbcConnections = async () => {
  const chainId = await getChainId();
  if (!chainId) throw new Error('Could not fetch chain id');

  const registryClient = new ChainRegistryClient();
  const { ibcConnections } = await registryClient.get(chainId);
  return ibcConnections;
};
