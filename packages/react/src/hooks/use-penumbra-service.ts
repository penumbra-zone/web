import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { PenumbraService } from '@penumbra-zone/protobuf';
import { useMemo } from 'react';
import { usePenumbraTransportAsync, usePenumbraTransportSync } from './use-penumbra-transport.js';
import { usePenumbra } from './use-penumbra.js';

export const usePenumbraService = <S extends PenumbraService>(
  service: S,
): PromiseClient<S> | undefined => {
  const { transport } = usePenumbra();
  return useMemo(() => transport && createPromiseClient(service, transport), [service, transport]);
};

export const usePenumbraServiceSync = <S extends PenumbraService>(service: S): PromiseClient<S> => {
  const transport = usePenumbraTransportSync();
  return useMemo(() => createPromiseClient(service, transport), [service, transport]);
};

export const usePenumbraServiceAsync = <S extends PenumbraService>(
  service: S,
): Promise<PromiseClient<S>> => {
  const transportPromise = usePenumbraTransportAsync();
  return useMemo(
    () => transportPromise.then(transport => createPromiseClient(service, transport)),
    [service, transportPromise],
  );
};
