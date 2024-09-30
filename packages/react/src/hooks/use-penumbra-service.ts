import { PromiseClient } from '@connectrpc/connect';
import { useMemo } from 'react';
import { usePenumbra } from './use-penumbra.js';
import { ServiceType } from '@bufbuild/protobuf';

export const usePenumbraService = <S extends ServiceType>(
  serviceType: S,
): PromiseClient<S> | undefined => {
  const penumbra = usePenumbra();
  const connected = penumbra.connected;
  return useMemo(
    () => (connected ? penumbra.service(serviceType) : undefined),
    [connected, penumbra, serviceType],
  );
};
