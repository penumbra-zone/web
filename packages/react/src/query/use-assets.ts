import { getDenomMetadata } from '@penumbra-zone/getters/assets-response';
import { ViewService } from '@penumbra-zone/protobuf';
import { useQuery } from '@tanstack/react-query';
import { usePenumbra } from '../hooks/use-penumbra';
import { usePenumbraService } from '../hooks/use-penumbra-service';
import { PenumbraInjectionState } from '@penumbra-zone/client';

export const useAssets = () => {
  const penumbra = usePenumbra();
  const viewClient = usePenumbraService(ViewService);
  return useQuery(
    [penumbra.origin, 'assets'],
    async () => Array.fromAsync((await viewClient).assets({})),
    {
      select: data => data.map(getDenomMetadata),
      enabled: penumbra.state === PenumbraInjectionState.Connected,
    },
  );
};
