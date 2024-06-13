import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { PenumbraService } from '@penumbra-zone/protobuf';
import { useMemo } from 'react';
import { usePenumbraTransport } from './use-penumbra-transport';

export const usePenumbraService = <S extends PenumbraService>(service: S): PromiseClient<S> => {
  const transport = usePenumbraTransport();
  const client = useMemo(() => createPromiseClient(service, transport), [service, transport]);
  return client;
};
