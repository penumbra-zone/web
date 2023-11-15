import { CompactBlockQuerier } from './queriers/compact-block';
import { AppQuerier } from './queriers/app';
import { TendermintQuerier } from './queriers/tendermint';
import { ShieldedPoolQuerier } from './queriers/shielded-pool';
import { RootQuerierInterface } from '@penumbra-zone/types';
import { IbcClientQuerier } from './queriers/ibc-client';

// Given the amount of query services, this root querier aggregates them all
// to make it easier for consumers
export class RootQuerier implements RootQuerierInterface {
  readonly app: AppQuerier;
  readonly compactBlock: CompactBlockQuerier;
  readonly tendermint: TendermintQuerier;
  readonly shieldedPool: ShieldedPoolQuerier;
  readonly ibcClient: IbcClientQuerier;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.app = new AppQuerier({ grpcEndpoint });
    this.compactBlock = new CompactBlockQuerier({ grpcEndpoint });
    this.tendermint = new TendermintQuerier({ grpcEndpoint });
    this.shieldedPool = new ShieldedPoolQuerier({ grpcEndpoint });
    this.ibcClient = new IbcClientQuerier({ grpcEndpoint });
  }
}
