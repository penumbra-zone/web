import { PenumbraClient, PenumbraManifest } from '@penumbra-zone/client';
import { useQuery } from '@tanstack/react-query';

/**
 * Fetches the object with keys as provider origins and values as provider manifests.
 */
export const useProviderManifests = () => {
  return useQuery({
    queryKey: ['provider-manifests'],
    queryFn: async () => {
      const providers = PenumbraClient.getProviderManifests();

      const resolvedManifests = await Promise.all(
        Object.entries(providers).map(async ([key, promise]) => {
          const value = await promise;
          return [key, value];
        }),
      );

      return Object.fromEntries(resolvedManifests) as Record<string, PenumbraManifest>;
    },
  });
};
