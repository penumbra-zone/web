import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import { QueryService as CnidariumQueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/cnidarium/v1/cnidarium_connect';
import { CnidariumQuerierInterface } from '@penumbra-zone/types/src/querier';
import { MerkleRoot } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';

export class CnidariumQuerier implements CnidariumQuerierInterface {
  private readonly client: PromiseClient<typeof CnidariumQueryService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, CnidariumQueryService);
  }

  async fetchRemoteRoot(blockHeight: bigint): Promise<MerkleRoot | undefined> {
    const { value } = await this.client.keyValue({
      key: `sct/tree/anchor_by_height/${blockHeight}`,
    });
    const root = value?.value && MerkleRoot.fromBinary(value.value);
    console.log('fetchRemoteRoot', root?.inner);
    return root;
  }
}
