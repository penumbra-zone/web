import { ViewService } from '@penumbra-zone/protobuf';
import { createPromiseClient } from '@connectrpc/connect';
import { createChannelTransport } from '@penumbra-zone/transport-dom/create';
import { CRSessionClient } from '@penumbra-zone/transport-chrome/session-client';
import { jsonOptions } from '@penumbra-zone/protobuf';

const port = CRSessionClient.init(PRAX);

const extensionPageTransport = createChannelTransport({
  jsonOptions,
  getPort: () => Promise.resolve(port),
});

export const viewClient = createPromiseClient(ViewService, extensionPageTransport);
