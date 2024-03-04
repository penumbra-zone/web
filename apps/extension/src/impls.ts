import { createPromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { createProxyImpl } from '@penumbra-zone/transport-dom/proxy';
import { rethrowImplErrors } from './utils/rethrow-impl-errors';
import { Query as IbcProxy } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';
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
import { TendermintProxyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/util/tendermint_proxy/v1/tendermint_proxy_connect';
import { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1/custody_connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { custodyImpl } from '@penumbra-zone/router/src/grpc/custody';
import { viewImpl } from '@penumbra-zone/router/src/grpc/view-protocol-server';

import { localExtStorage } from '@penumbra-zone/storage';
const grpcEndpoint = await localExtStorage.get('grpcEndpoint');

const penumbraProxies = [
  IbcProxy,

  AppService,
  CompactBlockService,
  DexService,
  DexSimulationService,
  GovernanceService,
  SctService,
  ShieldedPoolService,
  StakeService,
  TendermintProxyService,
].map(
  serviceType =>
    [
      serviceType,
      createProxyImpl(
        serviceType,
        createPromiseClient(serviceType, createGrpcWebTransport({ baseUrl: grpcEndpoint })),
      ),
    ] as const,
);

export const rpcImpls = [
  // rpc local implementations
  // @ts-expect-error TODO: accept partial impl
  [CustodyService, rethrowImplErrors(CustodyService, custodyImpl)],
  [ViewService, rethrowImplErrors(ViewService, viewImpl)],
  // rpc remote proxies
  ...penumbraProxies,
] as const;
