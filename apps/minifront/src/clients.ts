import { createPraxClient } from '@penumbra-zone/client/prax';
import {
  CustodyService,
  DexSimulationService,
  IbcChannelService,
  IbcClientService,
  IbcConnectionService,
  SctService,
  StakeService,
  TendermintProxyService,
  ViewService,
} from '@penumbra-zone/protobuf';

export const viewClient = createPraxClient(ViewService);

export const custodyClient = createPraxClient(CustodyService);

export const simulateClient = createPraxClient(DexSimulationService);

export const ibcClient = createPraxClient(IbcClientService);

export const ibcChannelClient = createPraxClient(IbcChannelService);

export const ibcConnectionClient = createPraxClient(IbcConnectionService);

export const sctClient = createPraxClient(SctService);

export const stakeClient = createPraxClient(StakeService);

export const tendermintClient = createPraxClient(TendermintProxyService);
