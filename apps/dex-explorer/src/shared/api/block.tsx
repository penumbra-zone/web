import { useQuery } from '@tanstack/react-query';
import { BlockInfo } from '@/shared/api/indexer/lps';

export const useBlockInfo = (startHeight: number | string, endHeight?: number | string) => {
  return useQuery({
    queryKey: ['blockInfo', startHeight, endHeight],
    queryFn: async (): Promise<BlockInfo[]> => {
      return (await fetch(`/api/blocks/${startHeight}/${endHeight ?? ''}`).then(res =>
        res.json(),
      )) as BlockInfo[];
    },
  });
};

export const useBlockTimestamps = (startHeight?: number | string, endHeight?: number | string) => {
  return useQuery({
    queryKey: ['blockTimestamps', startHeight, endHeight],
    queryFn: async (): Promise<BlockInfo[]> => {
      if (!startHeight || !endHeight) {
        return [];
      }

      return (await fetch(`/api/blockTimestamps/range/${startHeight}/${endHeight}`).then(res =>
        res.json(),
      )) as BlockInfo[];
    },
  });
};
