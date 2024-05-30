import type { CustodyService, ViewService } from './penumbra';
import type { DexSimulationService, SctService, StakeService } from './penumbra-core';
import type { TendermintProxyService } from './penumbra-proxy';
import type { IbcChannelService, IbcClientService, IbcConnectionService } from './ibc-core';

export type PenumbraService =
  | typeof ViewService
  | typeof CustodyService
  | typeof DexSimulationService
  | typeof IbcClientService
  | typeof IbcChannelService
  | typeof IbcConnectionService
  | typeof SctService
  | typeof StakeService
  | typeof TendermintProxyService;
