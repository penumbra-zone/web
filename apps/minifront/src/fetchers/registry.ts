import { ChainRegistryClient, Registry } from '@penumbra-labs/registry';
import { useQuery } from '@tanstack/react-query';
import { getChainId } from './chain-id';

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
