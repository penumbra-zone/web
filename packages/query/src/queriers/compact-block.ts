import { PromiseClient } from '@connectrpc/connect';
import { CompactBlockRangeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/compact_block/v1alpha1/compact_block_pb';
import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/compact_block/v1alpha1/compact_block_connect';
import { createClient } from './utils';

interface CompactBlockRangeParams {
  startHeight: bigint;
  keepAlive: boolean; // Will continuously receive blocks as long as service worker is running
  abortSignal: AbortSignal;
}

export class CompactBlockQuerier {
  private readonly client: PromiseClient<typeof QueryService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, QueryService);
  }

  compactBlockRange({ startHeight, keepAlive, abortSignal }: CompactBlockRangeParams) {
    const req = new CompactBlockRangeRequest({ keepAlive, startHeight });
    return this.client.compactBlockRange(req, { signal: abortSignal });
  }
}
