import { useQuery } from '@tanstack/react-query';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block.ts';
import { RouteBookResponse, RouteBookResponseJson } from '@/shared/api/server/book/types';
import { deserializeRouteBookResponseJson } from '@/shared/api/server/book/serialization.ts';

export const useBook = (symbol1: string | undefined, symbol2: string | undefined) => {
  const query = useQuery({
    queryKey: ['book', symbol1, symbol2],
    queryFn: async (): Promise<RouteBookResponse> => {
      if (!symbol1 || !symbol2) {
        throw new Error('Missing symbols');
      }

      const paramsObj = {
        baseAsset: symbol1,
        quoteAsset: symbol2,
      };
      const baseUrl = '/api/book';
      const urlParams = new URLSearchParams(paramsObj).toString();
      const res = await fetch(`${baseUrl}?${urlParams}`);
      const data = (await res.json()) as RouteBookResponseJson;
      return deserializeRouteBookResponseJson(data);
    },
    enabled: !!symbol1 && !!symbol2,
  });

  useRefetchOnNewBlock(query);

  return query;
};
