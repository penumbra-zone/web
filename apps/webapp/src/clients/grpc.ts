import { createPromiseClient } from '@connectrpc/connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { createChannelTransport } from '@penumbra-zone/transport';
import { SimulationService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/dex/v1alpha1/dex_connect';
import { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1alpha1/custody_connect';
import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';
import { getPenumbraPort } from './penumbra-port';
import { jsonOptions } from '@penumbra-zone/types/src/json-options';

const transOpts = {
  defaultTimeoutMs: 10000,
  getPort: getPenumbraPort,
  jsonOptions,
};

export const viewClient = createPromiseClient(
  ViewService,
  createChannelTransport({ serviceType: ViewService, ...transOpts }),
);

export const custodyClient = createPromiseClient(
  CustodyService,
  createChannelTransport({ serviceType: CustodyService, ...transOpts }),
);

export const simulateClient = createPromiseClient(
  SimulationService,
  createChannelTransport({ serviceType: SimulationService, ...transOpts }),
);

export const ibcClient = createPromiseClient(
  IbcClientService,
  createChannelTransport({ serviceType: IbcClientService, ...transOpts }),
);
