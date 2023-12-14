import { createPromiseClient } from '@connectrpc/connect';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { createChannelTransport } from '@penumbra-zone/transport';
import { SimulationService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/dex/v1alpha1/dex_connect';
import { CustodyProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1alpha1/custody_connect';
import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';
import { getPenumbraPort } from './penumbra-port';
import { typeRegistry } from '@penumbra-zone/types/src/registry';

const transOpts = {
  defaultTimeoutMs: 10000,
  getPort: getPenumbraPort,
  jsonOptions: {
    typeRegistry,
  },
};

export const viewClient = createPromiseClient(
  ViewProtocolService,
  createChannelTransport({ serviceType: ViewProtocolService, ...transOpts }),
);

export const custodyClient = createPromiseClient(
  CustodyProtocolService,
  createChannelTransport({ serviceType: CustodyProtocolService, ...transOpts }),
);

export const simulateClient = createPromiseClient(
  SimulationService,
  createChannelTransport({ serviceType: SimulationService, ...transOpts }),
);

export const ibcClient = createPromiseClient(
  IbcClientService,
  createChannelTransport({ serviceType: IbcClientService, ...transOpts }),
);
