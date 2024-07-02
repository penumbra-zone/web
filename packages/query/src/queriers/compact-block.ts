import { PromiseClient } from '@connectrpc/connect';
import { CompactBlockRangeResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/compact_block/v1/compact_block_pb';
import { CompactBlockService } from '@penumbra-zone/protobuf';
import { createClient } from './utils';
import type { CompactBlockQuerierInterface } from '@penumbra-zone/types/querier';

export class CompactBlockQuerier implements CompactBlockQuerierInterface {
  private readonly client: PromiseClient<typeof CompactBlockService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, CompactBlockService);
  }

  compactBlockRange(
    req: { startHeight?: bigint; keepAlive?: boolean },
    opt?: { signal?: AbortSignal },
  ): AsyncIterable<CompactBlockRangeResponse> {
    return this.client.compactBlockRange(req, opt);
  }
}
