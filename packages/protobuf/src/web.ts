import type { IbcChannelService, IbcClientService, IbcConnectionService } from './ibc-core.js';
import type { CustodyService, ViewService } from './penumbra.js';
import {
  CommunityPoolService,
  DexService,
  FeeService,
  GovernanceService,
  SctService,
  SimulationService,
  StakeService,
} from './penumbra-core.js';
import type { TendermintProxyService } from './penumbra-proxy.js';

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
  | typeof ViewService
  | typeof GovernanceService
  | typeof CommunityPoolService
  | typeof FeeService;
