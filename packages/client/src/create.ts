import { ServiceType } from '@bufbuild/protobuf';
import { createPromiseClient } from '@connectrpc/connect';
import { jsonOptions } from '@penumbra-zone/protobuf';
import { createChannelTransport } from '@penumbra-zone/transport-dom/create';
import { PenumbraClient } from './client.js';

export const createServiceClient = <T extends ServiceType>(client: PenumbraClient, service: T) =>
  createPromiseClient(
    service,
    createChannelTransport({
      getPort: () => Promise.resolve(client.getMessagePort()),
      jsonOptions,
    }),
  );

export const createPenumbraClient = () => new PenumbraClient();
