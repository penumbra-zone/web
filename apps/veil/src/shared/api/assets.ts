import { ViewService } from '@penumbra-zone/protobuf';
import { getDenomMetadata } from '@penumbra-zone/getters/assets-response';
import { penumbra } from '@/shared/const/penumbra';
import { connectionStore } from '@/shared/model/connection';
import { useQuery } from '@tanstack/react-query';
import { useRegistryAssets } from '@/shared/api/registry';
import { AssetId, Metadata, Denom } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
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

export type GetMetadata = (assetId?: AssetId | Denom) => Metadata | undefined;

export const isDenom = (value?: Denom | AssetId): value is Denom =>
  value?.getType().typeName === Denom.typeName;

/**
 * A hook that returns a synchronous function for querying the metadata by assetId.
 * Needed for an optimized client-side asset fetching.
 */
export const useGetMetadata = (): GetMetadata => {
  const { data } = useAssets();

  // An object with keys as base64 encoded assetId OR denom string, and values as Metadata
  const assetIdMap = useMemo(() => {
    return data?.reduce<Map<string, Metadata>>((accum, asset) => {
      if (!asset.penumbraAssetId?.inner) {
        return accum;
      }
      accum.set(uint8ArrayToBase64(asset.penumbraAssetId.inner), asset);
      accum.set(asset.base, asset);
      return accum;
    }, new Map());
  }, [data]);

  return (id?: AssetId | Denom): Metadata | undefined => {
    const key = isDenom(id) ? id.denom : id?.inner && uint8ArrayToBase64(id.inner);
    if (!key) {
      return undefined;
    }

    return assetIdMap?.get(key);
  };
};
