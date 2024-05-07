import { AuctionQuerierInterface } from '@penumbra-zone/types/querier';
import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/auction/v1alpha1/auction_connect';
import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import {
  AuctionId,
  AuctionStateByIdResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';

export class AuctionQuerier implements AuctionQuerierInterface {
  private readonly client: PromiseClient<typeof QueryService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, QueryService);
  }

  auctionStateById(id: AuctionId): Promise<AuctionStateByIdResponse> {
    return this.client.auctionStateById({ id });
  }
}
