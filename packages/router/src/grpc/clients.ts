import { createPromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { testnetConstants } from '@penumbra-zone/constants';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';

const transport = createGrpcWebTransport({
  baseUrl: testnetConstants.grpcEndpoint,
});

export const viewClient = createPromiseClient(ViewProtocolService, transport);
