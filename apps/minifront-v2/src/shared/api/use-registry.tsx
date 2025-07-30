import { useQuery } from '@tanstack/react-query';
import { ChainRegistryClient } from '@penumbra-labs/registry';

// Simple registry hook similar to Veil's approach
export const useRegistry = () => {
  return useQuery({
    queryKey: ['penumbra-registry'],
    queryFn: async () => {
      const client = new ChainRegistryClient();
      return await client.remote.get('penumbra-1');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};
