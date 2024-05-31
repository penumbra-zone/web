import { createPraxClient } from '@penumbra-zone/client/prax';
import {
  CustodyService,
  IbcChannelService,
  IbcClientService,
  IbcConnectionService,
  SctService,
  SimulationService,
  StakeService,
  TendermintProxyService,
  ViewService,
} from '@penumbra-zone/protobuf';

export const custodyClient = createPraxClient(CustodyService);
export const ibcChannelClient = createPraxClient(IbcChannelService);
export const ibcClient = createPraxClient(IbcClientService);
export const ibcConnectionClient = createPraxClient(IbcConnectionService);
export const sctClient = createPraxClient(SctService);
export const simulationClient = createPraxClient(SimulationService);
export const stakeClient = createPraxClient(StakeService);
export const tendermintClient = createPraxClient(TendermintProxyService);
export const viewClient = createPraxClient(ViewService);
