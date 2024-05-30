import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import { CnidariumService } from '@penumbra-zone/protobuf';
import { KeyValueRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/cnidarium/v1/cnidarium_pb';
import { CnidariumQuerierInterface } from '@penumbra-zone/types/querier';
import { MerkleRoot } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';

export class CnidariumQuerier implements CnidariumQuerierInterface {
  private readonly client: PromiseClient<typeof CnidariumService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, CnidariumService);
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
