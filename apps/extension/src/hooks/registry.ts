import { useQuery } from '@tanstack/react-query';
import { ChainRegistryClient, Registry, Rpc } from '@penumbra-labs/registry';
import { getChainIdWithFallback } from './chain-id';

const getRegistry = async (): Promise<Registry> => {
  const chainId = await getChainIdWithFallback();
  const registryClient = new ChainRegistryClient();
  return registryClient.get(chainId);
};

export const useRegistry = () => {
  return useQuery({
    queryKey: ['registry'],
    queryFn: async (): Promise<Registry> => {
      const chainId = await getChainIdWithFallback();
      const registryClient = new ChainRegistryClient();
      return registryClient.get(chainId);
    },
    staleTime: Infinity,
  });
};

export const useRpcEndpoints = () => {
  return useQuery({
    queryKey: ['rpcEndpoints'],
    queryFn: async (): Promise<Rpc[]> => {
      const { rpcs } = await getRegistry();
      return rpcs;
    },
    staleTime: Infinity,
    retry: 1,
  });
};
