import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils.js';
import { SctService } from '@penumbra-zone/protobuf';
import { SctQuerierInterface } from '@penumbra-zone/types/querier';
import { TimestampByHeightRequest, TimestampByHeightResponse } from '@penumbra-zone/protobuf/types';

export class SctQuerier implements SctQuerierInterface {
  private readonly client: PromiseClient<typeof SctService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, SctService);
  }
  timestampByHeight(req: TimestampByHeightRequest): Promise<TimestampByHeightResponse> {
    return this.client.timestampByHeight(req);
  }
}
