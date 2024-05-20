import { AuctionQuerierInterface } from '@penumbra-zone/types/querier';
import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/auction/v1/auction_connect';
import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import {
  AuctionId,
  DutchAuction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { typeUrlMatchesTypeName } from '@penumbra-zone/types/protobuf';

export class AuctionQuerier implements AuctionQuerierInterface {
  private readonly client: PromiseClient<typeof QueryService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, QueryService);
  }

  async auctionStateById(id: AuctionId): Promise<
    // Add more auction types to this union type as they are created.
    DutchAuction | undefined
  > {
    const result = await this.client.auctionStateById({ id });

    // As more auction types are created, handle them here.
    if (typeUrlMatchesTypeName(result.auction?.typeUrl, DutchAuction.typeName)) {
      return DutchAuction.fromBinary(result.auction.value);
    }

    return undefined;
  }
}
