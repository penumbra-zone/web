import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import { QueryService as CnidariumQueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/cnidarium/v1/cnidarium_connect';
import { KeyValueRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/cnidarium/v1/cnidarium_pb';
import { CnidariumQuerierInterface } from '@penumbra-zone/types/src/querier';
import { MerkleRoot } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';

export class CnidariumQuerier implements CnidariumQuerierInterface {
  private readonly client: PromiseClient<typeof CnidariumQueryService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, CnidariumQueryService);
  }

  async fetchRemoteRoot(blockHeight: bigint): Promise<MerkleRoot> {
    const keyValueRequest = new KeyValueRequest({
      key: `sct/tree/anchor_by_height/${blockHeight}`,
    });
    const keyValue = await this.client.keyValue(keyValueRequest);
    if (!keyValue.value) throw new Error('no value in KeyValueResponse');

    return MerkleRoot.fromBinary(keyValue.value.value);
  }
}
