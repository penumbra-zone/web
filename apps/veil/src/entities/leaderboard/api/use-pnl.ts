'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/utils/api-fetch';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export const usePnL = ({
  variables,
  enabled,
}: {
  variables: {
    baseAsset: Metadata;
    quoteAsset: Metadata;
    startTime: number;
    endTime: number;
  };
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ['pnl', ...Object.values(variables)],
    queryFn: async () => {
      if (!variables.baseAsset.penumbraAssetId || !variables.quoteAsset.penumbraAssetId) {
        throw new Error('Missing required base or quote asset ID');
      }

      const resp = await apiFetch('/api/pnl', {
        baseAssetId: uint8ArrayToHex(variables.baseAsset.penumbraAssetId.inner),
        quoteAssetId: uint8ArrayToHex(variables.quoteAsset.penumbraAssetId.inner),
        startTime: variables.startTime.toString(),
        endTime: variables.endTime.toString(),
      });
      return resp;
    },
    enabled,
  });
};
