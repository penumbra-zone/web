import { useEffect, useState } from 'react';
import { viewClient } from '../clients/grpc';
import { useCollectedStream } from '@penumbra-zone/transport';
import {
  AssetsRequest,
  AssetsResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { accountSelector } from '../state/account';
import { useStore } from '../state';

export const useAssets = () => {
  const { isConnected } = useStore(accountSelector);
  const [assets, setAssets] = useState<AsyncIterable<AssetsResponse> | undefined>();

  useEffect(() => {
    if (!isConnected) return;
    const req = new AssetsRequest();
    setAssets(viewClient.assets(req));
  }, [isConnected]);

  return useCollectedStream(assets, isConnected);
};
