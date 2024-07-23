import { CompactBlockQuerier } from './queriers/compact-block.js';
import { AppQuerier } from './queriers/app.js';
import { TendermintQuerier } from './queriers/tendermint.js';
import { ShieldedPoolQuerier } from './queriers/shielded-pool.js';
import { IbcClientQuerier } from './queriers/ibc-client.js';
import { CnidariumQuerier } from './queriers/cnidarium.js';
import { StakeQuerier } from './queriers/staking.js';
import type { RootQuerierInterface } from '@penumbra-zone/types/querier';
import { AuctionQuerier } from './queriers/auction.js';
import { SctQuerier } from './queriers/sct.js';

// Given the amount of query services, this root querier aggregates them all
// to make it easier for consumers
export class RootQuerier implements RootQuerierInterface {
  readonly app: AppQuerier;
  readonly compactBlock: CompactBlockQuerier;
  readonly tendermint: TendermintQuerier;
  readonly shieldedPool: ShieldedPoolQuerier;
  readonly ibcClient: IbcClientQuerier;
  readonly sct: SctQuerier;
  readonly stake: StakeQuerier;
  readonly cnidarium: CnidariumQuerier;
  readonly auction: AuctionQuerier;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.app = new AppQuerier({ grpcEndpoint });
    this.compactBlock = new CompactBlockQuerier({ grpcEndpoint });
    this.tendermint = new TendermintQuerier({ grpcEndpoint });
    this.shieldedPool = new ShieldedPoolQuerier({ grpcEndpoint });
    this.ibcClient = new IbcClientQuerier({ grpcEndpoint });
    this.sct = new SctQuerier({ grpcEndpoint });
    this.stake = new StakeQuerier({ grpcEndpoint });
    this.cnidarium = new CnidariumQuerier({ grpcEndpoint });
    this.auction = new AuctionQuerier({ grpcEndpoint });
  }
}
