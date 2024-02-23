import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { createPromiseClient } from '@connectrpc/connect';
import { TendermintProxyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/util/tendermint_proxy/v1/tendermint_proxy_connect';
import { devBaseUrl, prodBaseUrl } from '../constants';

const transport = createGrpcWebTransport({
  baseUrl: import.meta.env.MODE === 'production' ? prodBaseUrl : devBaseUrl,
});

export const tendermintClient = createPromiseClient(TendermintProxyService, transport);
