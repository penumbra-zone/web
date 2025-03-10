import { ViewService } from '@penumbra-zone/protobuf';
import { getDenomMetadata } from '@penumbra-zone/getters/assets-response';
import { penumbra } from '@/shared/const/penumbra';
import { connectionStore } from '@/shared/model/connection';
import { useQuery } from '@tanstack/react-query';
import { useRegistryAssets } from '@/shared/api/registry';

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
