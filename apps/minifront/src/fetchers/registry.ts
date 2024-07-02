import { Chain, ChainRegistryClient, Registry } from '@penumbra-labs/registry';
import { useQuery } from '@tanstack/react-query';
import { getChainId } from './chain-id';
import { getAssetMetadataById } from './assets';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';

export const chainRegistryClient = new ChainRegistryClient();

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

  const stakingAssetId = chainRegistryClient.globals().stakingAssetId;
  const stakingAssetsMetadata = await getAssetMetadataById(stakingAssetId);

  if (!stakingAssetsMetadata) {
    throw new Error('Could not fetch staking asset metadata');
  }
  return stakingAssetsMetadata;
};

export const getChains = async (): Promise<Chain[]> => {
  const chainId = await getChainId();
  if (!chainId) throw new Error('Could not fetch chain id');

  const { ibcConnections } = chainRegistryClient.get(chainId);
  return ibcConnections;
};

// Gets a unique set of asset ids to quickly compare metadata to it
export const useAssetIds = (): Set<string> => {
  const { data } = useRegistry();

  if (!data) {
    return new Set();
  }

  const assets = chainRegistryClient.get(data.chainId).getAllAssets();

  return new Set(
    assets.map(asset => uint8ArrayToBase64(asset.penumbraAssetId?.inner ?? new Uint8Array())),
  );
};
