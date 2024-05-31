import type { IbcChannelService, IbcClientService, IbcConnectionService } from './ibc-core';
import type { CustodyService, ViewService } from './penumbra';
import type { DexService, SctService, SimulationService, StakeService } from './penumbra-core';
import type { TendermintProxyService } from './penumbra-proxy';

export type PenumbraService =
  | typeof CustodyService
  | typeof DexService
  | typeof IbcChannelService
  | typeof IbcClientService
  | typeof IbcConnectionService
  | typeof SctService
  | typeof SimulationService
  | typeof StakeService
  | typeof TendermintProxyService
  | typeof ViewService;
