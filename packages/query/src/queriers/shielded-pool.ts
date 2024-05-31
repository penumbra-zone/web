import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import { ShieldedPoolService } from '@penumbra-zone/protobuf';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import type { ShieldedPoolQuerierInterface } from '@penumbra-zone/types/querier';

export class ShieldedPoolQuerier implements ShieldedPoolQuerierInterface {
  private readonly client: PromiseClient<typeof ShieldedPoolService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, ShieldedPoolService);
  }

  async assetMetadataById(assetId: AssetId): Promise<Metadata | undefined> {
    const res = await this.client.assetMetadataById({ assetId });
    return res.denomMetadata;
  }
}
