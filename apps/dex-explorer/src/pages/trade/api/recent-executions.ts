import { useQuery } from '@tanstack/react-query';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block.ts';
import { usePathSymbols } from '@/pages/trade/model/use-path.ts';
import { apiFetch } from '@/shared/utils/api-fetch.ts';
import { RecentExecution } from '@/shared/api/server/recent-executions.ts';
import { registryQueryFn } from '@/shared/api/registry.ts';
import { Registry } from '@penumbra-labs/registry';
import { formatAmount } from '@penumbra-zone/types/amount';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { calculateDisplayPrice } from '@/shared/utils/price-conversion.ts';
import BigNumber from 'bignumber.js';

export interface RecentExecutionVV {
  kind: 'buy' | 'sell';
  amount: string;
  price: string;
  timestamp: string;
}

const addVV = (res: RecentExecution[], registry: Registry): RecentExecutionVV[] => {
  return res.map(r => {
    if (!r.amount.assetId || !r.amount.amount) {
      throw new Error('No asseId or Amount passed for recent execution');
    }
    const baseMetadata = registry.getMetadata(r.amount.assetId);
    const baseDisplayDenomExponent = getDisplayDenomExponent.optional(baseMetadata) ?? 0;

    const quoteMetadata = registry.getMetadata(r.price.assetId);
    const price = calculateDisplayPrice(r.price.amount, baseMetadata, quoteMetadata);

    return {
      kind: r.kind,
      amount: formatAmount({
        amount: r.amount.amount,
        exponent: baseDisplayDenomExponent,
        decimalPlaces: 4,
      }),
      price: new BigNumber(price).toFormat(4),
      timestamp: r.timestamp,
    };
  });
};

const LIMIT = 10;

export const useRecentExecutions = () => {
  const { baseSymbol, quoteSymbol } = usePathSymbols();

  const query = useQuery({
    queryKey: ['recent-executions', baseSymbol, quoteSymbol],
    queryFn: async () => {
      const results = await apiFetch<RecentExecution[]>('/api/recent-executions', {
        baseAsset: baseSymbol,
        quoteAsset: quoteSymbol,
        limit: String(LIMIT),
      });

      const registry = await registryQueryFn();

      return addVV(results, registry);
    },
  });

  useRefetchOnNewBlock('recent-executions', query);

  return query;
};
