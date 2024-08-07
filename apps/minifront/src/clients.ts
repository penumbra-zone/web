import { PromiseClient } from '@connectrpc/connect';
import {
  DexService,
  IbcChannelService,
  IbcClientService,
  IbcConnectionService,
  SctService,
  SimulationService,
  StakeService,
  TendermintProxyService,
  ViewService,
} from '@penumbra-zone/protobuf';
import { praxClient } from './prax';

export const dexClient: PromiseClient<typeof DexService> = praxClient.service(DexService);
export const ibcChannelClient: PromiseClient<typeof IbcChannelService> =
  praxClient.service(IbcChannelService);
export const ibcClient: PromiseClient<typeof IbcClientService> =
  praxClient.service(IbcClientService);
export const ibcConnectionClient: PromiseClient<typeof IbcConnectionService> =
  praxClient.service(IbcConnectionService);
export const sctClient: PromiseClient<typeof SctService> = praxClient.service(SctService);
export const simulationClient: PromiseClient<typeof SimulationService> =
  praxClient.service(SimulationService);
export const stakeClient: PromiseClient<typeof StakeService> = praxClient.service(StakeService);
export const tendermintClient: PromiseClient<typeof TendermintProxyService> =
  praxClient.service(TendermintProxyService);
export const viewClient: PromiseClient<typeof ViewService> = praxClient.service(ViewService);
