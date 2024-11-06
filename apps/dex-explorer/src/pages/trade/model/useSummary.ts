import { useQuery } from '@tanstack/react-query';
import { usePathSymbols } from '@/pages/trade/model/use-path.ts';
import { SummaryResponse } from '@/shared/api/server/summary.ts';

export const useSummary = () => {
  const { baseSymbol, quoteSymbol } = usePathSymbols();

  return useQuery({
    queryKey: ['summary', baseSymbol, quoteSymbol],
    retry: 1,
    queryFn: async () => {
      const paramsObj = {
        baseAsset: baseSymbol,
        quoteAsset: quoteSymbol,
      };
      const baseUrl = '/api/summary';
      const urlParams = new URLSearchParams(paramsObj).toString();
      const fetchRes = await fetch(`${baseUrl}?${urlParams}`);
      const jsonRes = (await fetchRes.json()) as SummaryResponse;
      if ('error' in jsonRes) {
        throw new Error(jsonRes.error);
      }
      return jsonRes;
    },
  });
};
