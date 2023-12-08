import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/storage/v1alpha1/storage_connect';
import {
  KeyValueRequest,
  KeyValueResponse_Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/storage/v1alpha1/storage_pb';
import { StorageQuerierInterface } from '@penumbra-zone/types';

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
