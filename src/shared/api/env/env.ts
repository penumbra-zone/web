import { useQuery } from '@tanstack/react-query';
import { ClientEnv } from '@/shared/api/env/types';

export const useEnv = () => {
  return useQuery({
    queryKey: ['clientEnv'],
    queryFn: async (): Promise<ClientEnv> => {
      const res = await fetch('/api/env');
      return (await res.json()) as ClientEnv;
    },
    staleTime: Infinity,
  });
};
