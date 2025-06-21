import { useQuery } from '@tanstack/react-query';
import { usePathSymbols } from '@/pages/trade/model/use-path.ts';
import { DurationWindow } from '@/shared/utils/duration.ts';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block.ts';
import { fetchSummary, Summary } from '@/shared/api/server/summary';
import { useAssets } from '@/shared/api/assets';
import { deserialize, serialize } from '@/shared/utils/serializer';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

interface SummaryWithMetadata extends Summary {
  start: Metadata;
  end: Metadata;
}

export const useSummary = (
  window: DurationWindow,
  baseSymbolProp?: string,
  quoteSymbolProp?: string,
) => {
  const { baseSymbol: baseSymbolFromPath, quoteSymbol: quoteSymbolFromPath } = usePathSymbols();
  const baseSymbol = baseSymbolProp ?? baseSymbolFromPath;
  const quoteSymbol = quoteSymbolProp ?? quoteSymbolFromPath;

  const { data: assets } = useAssets();
  const start = assets.find(x => x.symbol === baseSymbol);
  const end = assets.find(x => x.symbol === quoteSymbol);
  const startAsset = start?.penumbraAssetId;
  const endAsset = end?.penumbraAssetId;

  const query = useQuery({
    queryKey: ['summary', baseSymbol, quoteSymbol],
    retry: 1,
    enabled: startAsset !== undefined && endAsset !== undefined,
    queryFn: async (): Promise<SummaryWithMetadata | undefined> => {
      if (
        startAsset === undefined ||
        endAsset === undefined ||
        start === undefined ||
        end === undefined
      ) {
        return undefined;
      }
      const res = await fetchSummary(serialize(startAsset), serialize(endAsset), window);
      const out = deserialize<Summary>(res);
      return { ...out, start, end };
    },
  });

  useRefetchOnNewBlock('summary', query);

  return query;
};
