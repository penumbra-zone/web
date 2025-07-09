import { useQuery } from '@tanstack/react-query';
import { fetchShieldingDeposits, ShieldingDepositWithMeta } from './server/shielding-deposits';
import { deserialize } from '@/shared/utils/serializer';

/**
 * React-Query hook that fetches the most recent shielding deposits using
 * the server function and deserializes them for client use.
 */
export const useShieldingDeposits = (limit = 100) => {
  return useQuery({
    queryKey: ['shielding-deposits', limit],
    queryFn: async () => {
      const serialized = await fetchShieldingDeposits(limit);
      return deserialize<ShieldingDepositWithMeta[]>(serialized);
    },
    refetchInterval: 1000,
    staleTime: 5000,
  });
};
