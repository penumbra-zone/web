import { createPromiseClient } from '@connectrpc/connect';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { createEventTransport } from 'penumbra-transport';

export const client = createPromiseClient(
  ViewProtocolService,
  createEventTransport(ViewProtocolService),
);
