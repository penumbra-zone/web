import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import {
  ChainParametersRequest,
  KeyValueRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1alpha1/app_pb';
import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/app/v1alpha1/app_connect';

export class AppQuerier {
  private readonly client: PromiseClient<typeof QueryService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, QueryService);
  }

  async chainParameters() {
    const req = new ChainParametersRequest();
    const res = await this.client.chainParameters(req);
    return res.chainParameters!;
  }

  async keyValue(key: string): Promise<Uint8Array> {
    const keyValueRequest = new KeyValueRequest({ key });
    const keyValue = await this.client.keyValue(keyValueRequest);
    return keyValue.value!.value;
  }
}
