import { createPromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { testnetConstants } from '@penumbra-zone/constants';
import { TendermintProxyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/util/tendermint_proxy/v1alpha1/tendermint_proxy_connect';

const transport = createGrpcWebTransport({
  baseUrl: testnetConstants.grpcEndpoint,
});

export const tendermintClient = createPromiseClient(TendermintProxyService, transport);
