import { useQuery } from '@tanstack/react-query';
import { CandlestickData } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

export const useCandles = (
  symbol1: string,
  symbol2: string,
  startBlock: number | undefined,
  limit: number,
) => {
  return useQuery({
    queryKey: ['candles', symbol1, symbol2, startBlock, limit],
    queryFn: async (): Promise<CandlestickData[]> => {
      if (startBlock === undefined) {
        return [];
      }

      return (await fetch(`/api/candles/${symbol1}/${symbol2}/${startBlock}/${limit}`).then(resp =>
        resp.json(),
      )) as CandlestickData[];
    },
  });
};
