import { createPromiseClient } from '@connectrpc/connect';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { createEventTransport } from 'penumbra-transport';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { testnetConstants } from 'penumbra-constants';
import { SimulationService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/dex/v1alpha1/dex_connect';

export const viewClient = createPromiseClient(
  ViewProtocolService,
  createEventTransport(ViewProtocolService),
);

const transport = createGrpcWebTransport({
  baseUrl: testnetConstants.grpcEndpoint,
});

export const simulateClient = createPromiseClient(SimulationService, transport);
