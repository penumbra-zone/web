import { useQuery } from '@tanstack/react-query';
import { CandlestickData } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block.ts';

export const useCandles = (
  symbol1: string,
  symbol2: string,
  startBlock: number | undefined,
  limit: number,
) => {
  const query = useQuery({
    queryKey: ['candles', symbol1, symbol2, startBlock, limit],
    queryFn: async (): Promise<CandlestickData[]> => {
      if (startBlock === undefined) {
        return [];
      }
      const res = await fetch(`/api/candles/${symbol1}/${symbol2}/${startBlock}/${limit}`);
      return (await res.json()) as CandlestickData[];
    },
  });

  useRefetchOnNewBlock(query);

  return query;
};
