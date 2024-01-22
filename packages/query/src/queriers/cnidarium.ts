import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import { QueryService as CnidariumQueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/cnidarium/v1alpha1/cnidarium_connect';

import {
  KeyValueRequest,
  KeyValueResponse_Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/cnidarium/v1alpha1/cnidarium_pb';
import { CnidariumQuerierInterface } from '@penumbra-zone/types';

export class CnidariumQuerier implements CnidariumQuerierInterface {
  private readonly client: PromiseClient<typeof CnidariumQueryService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, CnidariumQueryService);
  }

  async keyValue(key: string): Promise<KeyValueResponse_Value['value']> {
    const keyValueRequest = new KeyValueRequest({ key });
    const keyValue = await this.client.keyValue(keyValueRequest);
    return keyValue.value!.value;
  }
}
