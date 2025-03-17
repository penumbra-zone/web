import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { createClient } from '@connectrpc/connect';
import { TendermintProxyService } from '@penumbra-zone/protobuf';
import { devBaseUrl, prodBaseUrl } from '../constants';

const transport = createGrpcWebTransport({
  baseUrl: import.meta.env.DEV ? devBaseUrl : prodBaseUrl,
});

export const tendermintClient = createClient(TendermintProxyService, transport);
