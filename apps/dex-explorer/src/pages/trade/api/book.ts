import { useQuery } from '@tanstack/react-query';
import { Position } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { JsonValue } from '@bufbuild/protobuf';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block.ts';

interface BookResponse {
  asks: Position[];
  bids: Position[];
}

interface BookResponseJson {
  asks: JsonValue[];
  bids: JsonValue[];
}

export const useBook = (
  symbol1: string | undefined,
  symbol2: string | undefined,
  hops: number | undefined,
  limit: number | undefined,
) => {
  const query = useQuery({
    queryKey: ['book', symbol1, symbol2, hops, limit],
    queryFn: async (): Promise<BookResponse> => {
      if (!symbol1 || !symbol2 || !limit) {
        return {
          asks: [],
          bids: [],
        };
      }
      const res = await fetch(`/api/book/${symbol1}/${symbol2}/${hops}/${limit}`);
      const data = (await res.json()) as BookResponseJson;

      return {
        asks: data.asks.map(jsonValue => Position.fromJson(jsonValue)),
        bids: data.bids.map(jsonValue => Position.fromJson(jsonValue)),
      };
    },
  });

  useRefetchOnNewBlock(query);

  return query;
};
