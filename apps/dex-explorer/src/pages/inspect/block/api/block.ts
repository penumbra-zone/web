import { useQuery } from '@tanstack/react-query';
import { BlockSummaryApiResponse } from '@/shared/api/server/block/types';
import { apiFetch } from '@/shared/utils/api-fetch';

export const useBlockSummary = (height: string) => {
  return useQuery({
    queryKey: ['block', height],
    retry: 1,
    queryFn: async (): Promise<BlockSummaryApiResponse> => {
      if (!height) {
        throw new Error('Invalid block height');
      }
      return apiFetch<BlockSummaryApiResponse>(`/api/block/${height}`);
    },
  });
};
