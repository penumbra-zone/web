import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/utils/api-fetch';
import { useRegistryAssets } from '@/shared/api/registry';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';
import { EpochResultsRequest, EpochResultsApiResponse } from '../server/epoch-results';
import type { MappedGauge } from '@/pages/tournament/server/previous-epochs';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { assetPatterns } from '@penumbra-zone/types/assets';

/**
 * Requests voting results of a given epoch. Returns percentages of each
 * asset within the epoch and an array of `assetGauges` – results merged
 * with registry asset metadata that usually gives an array of asset with 0 votes.
 */
export const useEpochResults = (
  name: string,
  params: Partial<EpochResultsRequest>,
  disabled?: boolean,
  search = '',
) => {
  const { data: assets } = useRegistryAssets();

  const query = useQuery({
    queryKey: [name, params.epoch, params.limit, params.page, params.sortKey, params.sortDirection],
    enabled: !!params.epoch && !disabled,
    queryFn: async () => {
      return apiFetch<EpochResultsApiResponse>('/api/tournament/epoch-results', params);
    },
  });

  useRefetchOnNewBlock(name, query, disabled);

  // collect all the gauges for the current epoch by the asset denom
  const gaugeMapByDenom = useMemo(
    () =>
      (query.data?.data ?? []).reduce<Map<string, MappedGauge>>((accum, current) => {
        accum.set(current.asset.base, current);
        return accum;
      }, new Map()),
    [query.data?.data],
  );

  // filters assets from the registry that are IBC-assets and match the search query
  const filteredAssets = useMemo<Metadata[]>(() => {
    return assets.filter(asset => {
      return (
        assetPatterns.ibc.matches(asset.base) &&
        (asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
          asset.description.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [assets, search]);

  // adapts filtered assets to the gauges
  const assetGauges = useMemo<MappedGauge[]>(() => {
    return filteredAssets.map(asset => {
      const fromGauge = gaugeMapByDenom.get(asset.base);
      if (fromGauge) {
        return fromGauge;
      }

      return {
        asset,
        epoch: 0,
        votes: 0,
        portion: 0,
      };
    });
  }, [filteredAssets, gaugeMapByDenom]);

  return {
    ...query,
    assetGauges,
  };
};
