import { AuctionQuerierInterface } from '@penumbra-zone/types/querier';
import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/auction/v1alpha1/auction_connect';
import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import {
  AuctionId,
  AuctionStateByIdResponse,
  AuctionStateByIdsResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';
import Array from '@penumbra-zone/polyfills/Array.fromAsync';

export class AuctionQuerier implements AuctionQuerierInterface {
  private readonly client: PromiseClient<typeof QueryService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, QueryService);
  }

  async auctionStateById(id: AuctionId): Promise<AuctionStateByIdResponse> {
    const result = await this.client.auctionStateById({ id });
    return result;
  }

  auctionStateByIds(ids: AuctionId[]): Promise<AuctionStateByIdsResponse[]> {
    return Array.fromAsync(this.client.auctionStateByIds({ id: ids }));
  }
}
