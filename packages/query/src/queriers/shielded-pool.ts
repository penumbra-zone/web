import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import { DenomMetadataByIdRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_connect';
import {
  AssetId,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

export class ShieldedPoolQuerier {
  private readonly client: PromiseClient<typeof QueryService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, QueryService);
  }

  async denomMetadata(assetId: AssetId): Promise<DenomMetadata | undefined> {
    const request = new DenomMetadataByIdRequest({ assetId });
    const res = await this.client.denomMetadataById(request);
    return res.denomMetadata;
  }
}
