import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import { Base64Str, base64ToUint8Array } from 'penumbra-types';
import { DenomMetadataByIdRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_connect';
import { DenomMetadata } from 'penumbra-types/src/denom';

export class ShieldedPoolQuerier {
  private readonly client: PromiseClient<typeof QueryService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, QueryService);
  }

  async denomMetadata(assetId: Base64Str): Promise<DenomMetadata | undefined> {
    const request = new DenomMetadataByIdRequest({
      assetId: { inner: base64ToUint8Array(assetId) },
    });
    const res = await this.client.denomMetadataById(request);
    return res.denomMetadata;
  }
}
