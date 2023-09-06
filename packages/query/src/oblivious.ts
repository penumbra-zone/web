import { ObliviousQueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/client/v1alpha1/client_connect';
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import {
  ChainParametersRequest,
  CompactBlockRangeRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/client/v1alpha1/client_pb';

interface ObliviousQuerierProps {
  grpcEndpoint: string;
}

export class ObliviousQuerier {
  private readonly client: PromiseClient<typeof ObliviousQueryService>;

  constructor({ grpcEndpoint }: ObliviousQuerierProps) {
    this.client = this.createClient(grpcEndpoint);
  }

  compactBlockRange(
    startHeight: bigint,
    keepAlive: boolean, // Will continuously receive blocks as long as service worker is running
  ) {
    const req = new CompactBlockRangeRequest({ keepAlive, startHeight });
    return this.client.compactBlockRange(req);
  }

  async chainParameters() {
    const req = new ChainParametersRequest({});
    const res = await this.client.chainParameters(req);
    return res.chainParameters!;
  }

  private createClient(grpcEndpoint: string): PromiseClient<typeof ObliviousQueryService> {
    const transport = createGrpcWebTransport({
      baseUrl: grpcEndpoint,
    });
    return createPromiseClient(ObliviousQueryService, transport);
  }
}
