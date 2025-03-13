import { ViewService } from '@penumbra-zone/protobuf';
import { getDenomMetadata } from '@penumbra-zone/getters/assets-response';
import { penumbra } from '@/shared/const/penumbra';
import { connectionStore } from '@/shared/model/connection';
import { useQuery } from '@tanstack/react-query';
import { useRegistryAssets } from '@/shared/api/registry';
import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { useMemo } from 'react';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';

const useViewServiceAssets = () =>
  useQuery({
    queryKey: ['view-service-assets'],
    enabled: connectionStore.connected,
    queryFn: async () => {
      const responses = await Array.fromAsync(penumbra.service(ViewService).assets({}));
      return responses.map(getDenomMetadata);
    },
  });

/**
 * Returns the `Metadata[]` based on the provider connection state.
 * If connected, it fetches the assets from the `ViewService`'s `assets` method.
 * Otherwise, it fetches the assets from the remote registry.
 *
 * Must be used within `observer` mobX HOC
 **/
export const useAssets = () => {
  const registryAssets = useRegistryAssets();
  const accountAssets = useViewServiceAssets();

  return connectionStore.connected ? accountAssets : registryAssets;
};

export type GetMetadataByAssetId = (assetId?: AssetId) => Metadata | undefined;

/**
 * A hook that returns a synchronous function for querying the metadata by assetId.
 * Needed for an optimized client-side asset fetching.
 */
export const useGetMetadataByAssetId = (): GetMetadataByAssetId => {
  const { data } = useAssets();

  const assetIdMap = useMemo(() => {
    return data?.reduce<Map<string, Metadata>>((accum, asset) => {
      if (!asset.penumbraAssetId?.inner) {
        return accum;
      }
      accum.set(uint8ArrayToBase64(asset.penumbraAssetId.inner), asset);
      return accum;
    }, new Map());
  }, [data]);

  return (assetId?: AssetId): Metadata | undefined => {
    if (!assetId?.inner) {
      return undefined;
    }

    return assetIdMap?.get(uint8ArrayToBase64(assetId.inner));
  };
};
