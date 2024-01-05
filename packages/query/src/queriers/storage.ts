import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/cnidarium/v1alpha1/cnidarium_connect';

import { StorageQuerierInterface } from '@penumbra-zone/types';
import {
  KeyValueRequest,
  KeyValueResponse_Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/cnidarium/v1alpha1/cnidarium_pb';

export class StorageQuerier implements StorageQuerierInterface {
  private readonly client: PromiseClient<typeof QueryService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, QueryService);
  }

  async keyValue(key: string): Promise<KeyValueResponse_Value['value']> {
    const keyValueRequest = new KeyValueRequest({ key });
    const keyValue = await this.client.keyValue(keyValueRequest);
    return keyValue.value!.value;
  }
}
