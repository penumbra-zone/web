import { useQuery } from '@tanstack/react-query';
import { usePathToMetadata } from '@/pages/trade/model/use-path-to-metadata.ts';
import { SummaryResponse } from '@/shared/api/server/summary.ts';

export const useSummary = () => {
  const { baseAsset, quoteAsset, error: pathError } = usePathToMetadata();

  const res = useQuery({
    queryKey: ['summary', baseAsset, quoteAsset],
    enabled: !!baseAsset && !!quoteAsset,
    retry: 1,
    queryFn: async () => {
      if (!baseAsset || !quoteAsset) {
        throw new Error('Missing assets to get summary for');
      }

      const paramsObj = {
        baseAsset: baseAsset.symbol,
        quoteAsset: quoteAsset.symbol,
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

  return {
    ...res,
    error: pathError ?? res.error,
  };
};
