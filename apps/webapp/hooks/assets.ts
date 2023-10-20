import { useMemo } from 'react';
import { viewClient } from '../clients/grpc';
import { useCollectedStream } from '@penumbra-zone/transport';
import { AssetsRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

export const useAssets = () => {
  const assets = useMemo(() => {
    const req = new AssetsRequest();
    return viewClient.assets(req);
  }, []);

  return useCollectedStream(assets);
};
