import { createPraxClient } from '@penumbra-zone/client/prax';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { SimulationService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/dex/v1/dex_connect';
import { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1/custody_connect';
import { QueryService as StakeService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/stake/v1/stake_connect';
import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';
import { Query as IbcChannelService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/channel/v1/query_connect';
import { Query as IbcConnectionService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/connection/v1/query_connect';
import { QueryService as SctService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/sct/v1/sct_connect';

export const viewClient = createPraxClient(ViewService);

export const custodyClient = createPraxClient(CustodyService);

export const simulateClient = createPraxClient(SimulationService);

export const ibcClient = createPraxClient(IbcClientService);

export const ibcChannelClient = createPraxClient(IbcChannelService);

export const ibcConnectionClient = createPraxClient(IbcConnectionService);

export const sctClient = createPraxClient(SctService);

export const stakeClient = createPraxClient(StakeService);
