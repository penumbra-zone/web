import { createPromiseClient } from '@connectrpc/connect';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { createChannelTransport } from '@penumbra-zone/transport';
import { ClientConnectionManager } from '@penumbra-zone/transport/src/chrome-runtime';

export const grpcClient = createPromiseClient(
  ViewProtocolService,
  createChannelTransport(ViewProtocolService, () => ClientConnectionManager.init()),
);
