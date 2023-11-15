import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import { Query as IbcClientQuery } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';
import { IbcClientQuerierInterface } from '@penumbra-zone/types';
import {
  QueryClientStatesRequest,
  QueryClientStatesResponse,
} from '@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/query_pb';

export class IbcClientQuerier implements IbcClientQuerierInterface {
  private readonly client: PromiseClient<typeof IbcClientQuery>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, IbcClientQuery);
  }

  async ibcClientStates(req: QueryClientStatesRequest): Promise<QueryClientStatesResponse> {
    return await this.client.clientStates(req);
  }
}
