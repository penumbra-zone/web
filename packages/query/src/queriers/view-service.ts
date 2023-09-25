import { PromiseClient } from '@connectrpc/connect';
import { ChainParametersRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { createClient } from './utils';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';

export class ViewServiceQuerier {
  private readonly client: PromiseClient<typeof ViewProtocolService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, ViewProtocolService);
  }

  async chainParameters() {
    const req = new ChainParametersRequest();
    const res = await this.client.chainParameters(req);
    return res.parameters!;
  }
}
