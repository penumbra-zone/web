import { createPromiseClient } from '@connectrpc/connect';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { createChannelTransport } from '@penumbra-zone/transport';
import { SimulationService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/dex/v1alpha1/dex_connect';
import { CustodyProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1alpha1/custody_connect';
import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';
import { getPenumbraPort } from './penumbra-port';

export const viewClient = createPromiseClient(
  ViewProtocolService,
  createChannelTransport(ViewProtocolService, getPenumbraPort(ViewProtocolService.typeName)),
);

export const custodyClient = createPromiseClient(
  CustodyProtocolService,
  createChannelTransport(CustodyProtocolService, getPenumbraPort(CustodyProtocolService.typeName)),
);

export const simulateClient = createPromiseClient(
  SimulationService,
  createChannelTransport(SimulationService, getPenumbraPort(SimulationService.typeName)),
);

export const ibcClient = createPromiseClient(
  IbcClientService,
  createChannelTransport(IbcClientService, getPenumbraPort(IbcClientService.typeName)),
);
