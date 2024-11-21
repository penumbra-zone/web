import { useQuery } from '@tanstack/react-query';
import { usePathSymbols } from '@/pages/trade/model/use-path.ts';
import { DurationWindow } from '@/shared/utils/duration.ts';
import { SummaryDataResponse, SummaryResponse } from '@/shared/api/server/types.ts';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block.ts';

export const useSummary = (window: DurationWindow) => {
  const { baseSymbol, quoteSymbol } = usePathSymbols();

  const query = useQuery({
    queryKey: ['summary', baseSymbol, quoteSymbol],
    retry: 1,
    queryFn: async () => {
      const paramsObj = {
        durationWindow: window,
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

      if ('noData' in jsonRes) {
        return jsonRes;
      }

      return SummaryDataResponse.fromJson(jsonRes);
    },
  });

  useRefetchOnNewBlock(query);

  return query;
};
