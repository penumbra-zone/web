import { createPromiseClient } from '@connectrpc/connect';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { QueryClient } from '@tanstack/react-query';
import { createExtInternalEventTransport } from 'penumbra-transport/src/internal';

export const grpcClient = createPromiseClient(
  ViewProtocolService,
  createExtInternalEventTransport(ViewProtocolService),
);

export const queryClient = new QueryClient();
