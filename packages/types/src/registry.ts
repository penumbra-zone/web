import { createRegistry } from '@bufbuild/protobuf';

import { CustodyProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1alpha1/custody_connect';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';

import { Query as IbcQueryService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';

import { QueryService as AppService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/app/v1alpha1/app_connect';
import { QueryService as ChainService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/chain/v1alpha1/chain_connect';
import { QueryService as CompactBlockService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/compact_block/v1alpha1/compact_block_connect';
import {
  QueryService as DexService,
  SimulationService as DexSimulationService,
} from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/dex/v1alpha1/dex_connect';
import { QueryService as GovernanceService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/governance/v1alpha1/governance_connect';
import { QueryService as SctService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/sct/v1alpha1/sct_connect';
import { QueryService as ShieldedPoolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_connect';
import { QueryService as StakeService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/stake/v1alpha1/stake_connect';
import { TendermintProxyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/util/tendermint_proxy/v1alpha1/tendermint_proxy_connect';

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
  CustodyProtocolService,
  ViewProtocolService,

  IbcQueryService,

  AppService,
  ChainService,
  CompactBlockService,
  DexService,
  DexSimulationService,
  GovernanceService,
  SctService,
  ShieldedPoolService,
  StakeService,
  TendermintProxyService,
);

export const serviceTypeNames = [
  CustodyProtocolService.typeName,
  ViewProtocolService.typeName,

  IbcQueryService.typeName,

  AppService.typeName,
  ChainService.typeName,
  CompactBlockService.typeName,
  DexService.typeName,
  DexSimulationService.typeName,
  GovernanceService.typeName,
  SctService.typeName,
  ShieldedPoolService.typeName,
  StakeService.typeName,
  TendermintProxyService.typeName,
] as const;
