import { ViewService } from '@penumbra-zone/protobuf';
import { getDenomMetadata } from '@penumbra-zone/getters/assets-response';
import { penumbra } from '@/shared/const/penumbra';
import { connectionStore } from '@/shared/model/connection';
import { useQuery } from '@tanstack/react-query';
import { useRegistry } from '@/shared/api/registry';

/**
 * Returns the `Metadata[]` based on the provider connection state.
 * If connected, it fetches the assets from the `ViewService`'s `assets` method.
 * Otherwise, it fetches the assets from the remote registry.
 *
 * Must be used within `observer` mobX HOC
 **/
export const useAssets = () => {
  const { data: registry, error: registryErr } = useRegistry();

  const registryAssets = useQuery({
    queryKey: ['registry-assets'],
    enabled: Boolean(registry),
    queryFn: () => {
      if (!registry) {
        throw new Error('Registry not available');
      }
      return registry.getAllAssets();
    },
  });

  const accountAssets = useQuery({
    queryKey: ['view-service-assets'],
    enabled: connectionStore.connected,
    queryFn: async () => {
      const responses = await Array.fromAsync(penumbra.service(ViewService).assets({}));
      return responses.map(getDenomMetadata);
    },
  });

  return connectionStore.connected
    ? accountAssets
    : { ...registryAssets, error: registryAssets.error ?? registryErr };
};
