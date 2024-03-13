import { createPraxClient } from '@penumbra-zone/client';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { SimulationService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/dex/v1/dex_connect';
import { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1/custody_connect';
import { QueryService as StakeService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/stake/v1/stake_connect';
import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';
import { QueryService as SctService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/sct/v1/sct_connect';

export const viewClient = createPraxClient(ViewService);

export const custodyClient = createPraxClient(CustodyService);

export const simulateClient = createPraxClient(SimulationService);

export const ibcClient = createPraxClient(IbcClientService);

export const sctClient = createPraxClient(SctService);

export const stakeClient = createPraxClient(StakeService);
