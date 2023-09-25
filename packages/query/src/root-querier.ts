import { CompactBlockQuerier } from './queriers/compact-block';
import { AppQuerier } from './queriers/app';
import { NarsilQuerier } from './queriers/narsil';
import { ShieldedPoolQuerier } from './queriers/shielded-pool';

// Given the amount of query services, this root querier aggregates them all
// to make it easier for consumers
export class RootQuerier {
  readonly app: AppQuerier;
  readonly compactBlock: CompactBlockQuerier;
  readonly narsil: NarsilQuerier;
  readonly shieldedPool: ShieldedPoolQuerier;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.app = new AppQuerier({ grpcEndpoint });
    this.compactBlock = new CompactBlockQuerier({ grpcEndpoint });
    this.narsil = new NarsilQuerier({ grpcEndpoint });
    this.shieldedPool = new ShieldedPoolQuerier({ grpcEndpoint });
  }
}
