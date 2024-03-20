import { Query as IbcQueryService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';
import { QueryService as AppService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/app/v1/app_connect';
import { QueryService as CompactBlockService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/compact_block/v1/compact_block_connect';
import {
  QueryService as DexService,
  SimulationService as DexSimulationService,
} from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/dex/v1/dex_connect';
import { QueryService as GovernanceService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/governance/v1/governance_connect';
import { QueryService as SctService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/sct/v1/sct_connect';
import { QueryService as ShieldedPoolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/shielded_pool/v1/shielded_pool_connect';
import { QueryService as StakeService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/stake/v1/stake_connect';
import { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1/custody_connect';
import { TendermintProxyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/util/tendermint_proxy/v1/tendermint_proxy_connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { createRegistry, IMessageTypeRegistry } from '@bufbuild/protobuf';
import { ClientState } from '@buf/cosmos_ibc.bufbuild_es/ibc/lightclients/tendermint/v1/tendermint_pb';

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

export const typeRegistry: IMessageTypeRegistry = createRegistry(
  CustodyService,
  ViewService,

  AppService,
  ClientState,
  CompactBlockService,
  DexService,
  DexSimulationService,
  GovernanceService,
  IbcQueryService,
  SctService,
  ShieldedPoolService,
  StakeService,
  TendermintProxyService,
);

export const jsonOptions = {
  typeRegistry,

  // read options
  ignoreUnknownFields: true,

  // write options
  emitDefaultValues: false,
};

export const transportOptions = {
  defaultTimeoutMs: 10000,
  jsonOptions,
};
