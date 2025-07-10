import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/utils/api-fetch';
import { useGetMetadata } from '@/shared/api/assets';
import {
  ApiGauge,
  MappedGauge,
  PreviousEpochsApiResponse,
  PreviousEpochsRequest,
  PreviousEpochsSortDirection,
  PreviousEpochsSortKey,
} from '../server/previous-epochs';
import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

export interface UsePreviousEpochsData {
  epoch: number;
  gauge: MappedGauge[];
}

export const useMappedGauge = () => {
  const getMetadata = useGetMetadata();

  return (gauge: ApiGauge): MappedGauge => {
    const asset = getMetadata(
      new AssetId({
        inner: base64ToUint8Array(gauge.asset_id),
      }),
    );

    return {
      ...gauge,
      asset:
        asset ??
        new Metadata({
          base: gauge.asset_id,
          name: '',
          symbol: '',
          description: '',
          images: [],
        }),
    } satisfies MappedGauge;
  };
};

export const usePreviousEpochs = (
  connected: boolean,
  page = BASE_PAGE,
  limit = BASE_LIMIT,
  sortKey?: PreviousEpochsSortKey,
  sortDirection?: PreviousEpochsSortDirection,
) => {
  const getMappedGauge = useMappedGauge();

  const query = useQuery({
    queryKey: ['previous-epochs', connected, page, limit, sortKey, sortDirection],
    queryFn: async () => {
      const res = await apiFetch<PreviousEpochsApiResponse>('/api/tournament/previous-epochs', {
        limit,
        page,
        sortKey,
        sortDirection,
      } satisfies Partial<PreviousEpochsRequest>);

      return {
        total: res.total,
        data: res.data.map(
          epochData =>
            ({
              epoch: epochData.epoch,
              gauge: epochData.gauge.map(gauge => getMappedGauge(gauge)),
            }) satisfies UsePreviousEpochsData,
        ),
      } as { total: number; data: UsePreviousEpochsData[] };
    },
  });

  return {
    query,
    data: query.data?.data,
    total: query.data?.total ?? 0,
  };
};
