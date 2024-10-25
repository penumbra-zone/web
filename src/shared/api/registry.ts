import { ChainRegistryClient, Registry } from '@penumbra-labs/registry';
import { useQuery } from '@tanstack/react-query';
import { useEnv } from './env/env';

export const chainRegistryClient = new ChainRegistryClient();

export const useRegistry = () => {
  const { data: env, isLoading: isEnvLoading, error: envError } = useEnv();

  const {
    data: registry,
    isLoading: isRegistryLoading,
    error: registryError,
  } = useQuery({
    queryKey: ['penumbraRegistry', env],
    queryFn: async (): Promise<Registry> => {
      const chainId = env?.PENUMBRA_CHAIN_ID;
      if (!chainId) {
        throw new Error('chain id not available to query registry');
      }
      return chainRegistryClient.remote.get(chainId);
    },
    staleTime: Infinity,
    enabled: Boolean(env),
  });

  return {
    data: registry,
    isLoading: isEnvLoading || isRegistryLoading,
    error: envError ?? registryError,
  };
};
