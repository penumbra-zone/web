import { useMemo } from 'react';
import { viewClient } from '../clients/grpc';
import { useCollectedStream } from '@penumbra-zone/transport';
import { AssetsRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { useConnect } from './connect';
import { useQuery } from '@tanstack/react-query';

export const useAssets = () => {
  const { isConnected } = useConnect();

  const { data } = useQuery({
    enabled: isConnected,
    queryKey: ['assets'],
    queryFn: () => {
      const req = new AssetsRequest();
      return viewClient.assets(req);
    },
    refetchInterval: false,
  });

  return useCollectedStream(data);
};
