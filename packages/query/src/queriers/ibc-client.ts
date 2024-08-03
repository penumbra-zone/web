import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils.js';
import { IbcClientService } from '@penumbra-zone/protobuf';
import {
  QueryClientStatesRequest,
  QueryClientStatesResponse,
} from '@penumbra-zone/protobuf/ibc/core/client/v1/query_pb';
import type { IbcClientQuerierInterface } from '@penumbra-zone/types/querier';

export class IbcClientQuerier implements IbcClientQuerierInterface {
  private readonly client: PromiseClient<typeof IbcClientService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, IbcClientService);
  }

  async ibcClientStates(req: QueryClientStatesRequest): Promise<QueryClientStatesResponse> {
    return await this.client.clientStates(req);
  }
}
