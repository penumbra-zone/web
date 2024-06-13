import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { PenumbraService } from '@penumbra-zone/protobuf';
import { useMemo } from 'react';
import { usePenumbraTransport, usePenumbraTransportSync } from './use-penumbra-transport';

export const usePenumbraServiceSync = <S extends PenumbraService>(service: S): PromiseClient<S> => {
  const transport = usePenumbraTransportSync();
  return useMemo(() => createPromiseClient(service, transport), [service, transport]);
};

export const usePenumbraService = <S extends PenumbraService>(
  service: S,
): Promise<PromiseClient<S>> => {
  const transportPromise = usePenumbraTransport();
  return useMemo(
    () => transportPromise.then(transport => createPromiseClient(service, transport)),
    [service, transportPromise],
  );
};
