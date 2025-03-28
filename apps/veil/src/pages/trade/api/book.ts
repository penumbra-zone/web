import { useQuery } from '@tanstack/react-query';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block.ts';
import { RouteBookResponse } from '@/shared/api/server/book/types';
import { deserializeRouteBookResponseJson } from '@/shared/api/server/book/serialization.ts';
import { RouteBookApiResponse } from '@/shared/api/server/book';
import { usePathSymbols } from '@/pages/trade/model/use-path.ts';

export const useBook = (overrideBase?: string, overrideQuote?: string) => {
  const pathSymbols = usePathSymbols();
  const baseSymbol = overrideBase ?? pathSymbols.baseSymbol;
  const quoteSymbol = overrideQuote ?? pathSymbols.quoteSymbol;

  const query = useQuery({
    queryKey: ['book', baseSymbol, quoteSymbol],
    queryFn: async (): Promise<RouteBookResponse> => {
      const paramsObj = {
        baseAsset: baseSymbol,
        quoteAsset: quoteSymbol,
      };
      const baseUrl = '/api/book';
      const urlParams = new URLSearchParams(paramsObj).toString();
      const res = await fetch(`${baseUrl}?${urlParams}`);
      const jsonRes = (await res.json()) as RouteBookApiResponse;
      if ('error' in jsonRes) {
        throw new Error(jsonRes.error);
      }
      return deserializeRouteBookResponseJson(jsonRes);
    },
  });

  useRefetchOnNewBlock('routeBook', query);

  return query;
};
