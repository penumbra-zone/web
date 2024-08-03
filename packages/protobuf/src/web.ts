import type {
  IbcChannelService,
  IbcClientService,
  IbcConnectionService,
} from './services/cosmos-ibc-core.js';
import type { CustodyService } from './services/penumbra-custody.js';
import type { ViewService } from './services/penumbra-view.js';
import type {
  AppService,
  AuctionService,
  CommunityPoolService,
  CompactBlockService,
  DexService,
  SimulationService,
  FeeService,
  GovernanceService,
  SctService,
  ShieldedPoolService,
  StakeService,
} from './services/penumbra-core.js';
import type { TendermintProxyService } from './services/penumbra-util.js';

export type PenumbraService =
  | typeof AppService
  | typeof AuctionService
  | typeof CommunityPoolService
  | typeof CompactBlockService
  | typeof CustodyService
  | typeof DexService
  | typeof FeeService
  | typeof GovernanceService
  | typeof IbcChannelService
  | typeof IbcClientService
  | typeof IbcConnectionService
  | typeof SctService
  | typeof ShieldedPoolService
  | typeof SimulationService
  | typeof StakeService
  | typeof TendermintProxyService
  | typeof ViewService;
