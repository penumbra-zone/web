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
import { createPraxClient } from './prax';

export const dexClient: PromiseClient<typeof DexService> = createPraxClient(DexService);
export const ibcChannelClient: PromiseClient<typeof IbcChannelService> =
  createPraxClient(IbcChannelService);
export const ibcClient: PromiseClient<typeof IbcClientService> = createPraxClient(IbcClientService);
export const ibcConnectionClient: PromiseClient<typeof IbcConnectionService> =
  createPraxClient(IbcConnectionService);
export const sctClient: PromiseClient<typeof SctService> = createPraxClient(SctService);
export const simulationClient: PromiseClient<typeof SimulationService> =
  createPraxClient(SimulationService);
export const stakeClient: PromiseClient<typeof StakeService> = createPraxClient(StakeService);
export const tendermintClient: PromiseClient<typeof TendermintProxyService> =
  createPraxClient(TendermintProxyService);
export const viewClient: PromiseClient<typeof ViewService> = createPraxClient(ViewService);
