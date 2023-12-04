import { createRegistry } from '@bufbuild/protobuf';

import { Query as IbcQueryService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';

import { CustodyProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1alpha1/custody_connect';
import { SimulationService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/dex/v1alpha1/dex_connect';
import { TendermintProxyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/util/tendermint_proxy/v1alpha1/tendermint_proxy_connect';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';

/**
 * This type registry is for JSON serialization of protobuf messages.
 *
 * Some specced messages contain 'Any'-type fields, serialized with type
 * annotation URLs resolved with this registry. Chrome runtime messages require
 * contents to be JSONifiable, and 'Any' is used to pack for transport at that
 * boundary.
 *
 * This registry currently contains types for all services used in the
 * extension, and should be able to resolve any message type encountered.
 */

export const typeRegistry = createRegistry(
  IbcQueryService,
  CustodyProtocolService,
  SimulationService,
  TendermintProxyService,
  ViewProtocolService,
);

export const serviceTypeNames: string[] = [
  IbcQueryService.typeName,
  CustodyProtocolService.typeName,
  SimulationService.typeName,
  TendermintProxyService.typeName,
  ViewProtocolService.typeName,
];
