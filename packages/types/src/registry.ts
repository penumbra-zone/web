import { createRegistry } from '@bufbuild/protobuf';

import { Query as IbcQueryService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';

import { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1/custody_connect';
import { TendermintProxyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/util/tendermint_proxy/v1/tendermint_proxy_connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { ClientState } from '@buf/cosmos_ibc.bufbuild_es/ibc/lightclients/tendermint/v1/tendermint_pb';
import { SimulationService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/dex/v1/dex_connect';
import { QueryService as StakingService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/stake/v1/stake_connect';

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
  CustodyService,
  SimulationService,
  StakingService,
  TendermintProxyService,
  ViewService,
  ClientState,
);

export const serviceTypeNames = [
  IbcQueryService.typeName,
  CustodyService.typeName,
  SimulationService.typeName,
  StakingService.typeName,
  TendermintProxyService.typeName,
  ViewService.typeName,
] as const;
