import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/shielded_pool/v1/shielded_pool_connect';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ShieldedPoolQuerierInterface } from '@penumbra-zone/types';

export class ShieldedPoolQuerier implements ShieldedPoolQuerierInterface {
  private readonly client: PromiseClient<typeof QueryService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, QueryService);
  }

  async assetMetadata(assetId: AssetId): Promise<Metadata | undefined> {
    const res = await this.client.assetMetadataById({ assetId });
    return res.denomMetadata;
  }
}
