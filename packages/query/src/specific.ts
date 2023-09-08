import { SpecificQueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/client/v1alpha1/client_connect';
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { DenomMetadataByIdRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/client/v1alpha1/client_pb';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb';

interface SpecificQuerierProps {
  grpcEndpoint: string;
}

export class SpecificQuerier {
  private readonly client: PromiseClient<typeof SpecificQueryService>;

  constructor({ grpcEndpoint }: SpecificQuerierProps) {
    this.client = this.createClient(grpcEndpoint);
  }

  async denomMetadata(assetId: AssetId) {
    const request = new DenomMetadataByIdRequest({
      assetId: { inner: assetId.inner },
    });
    const res = await this.client.denomMetadataById(request);
    return res.denomMetadata;
  }

  private createClient(grpcEndpoint: string): PromiseClient<typeof SpecificQueryService> {
    const transport = createGrpcWebTransport({
      baseUrl: grpcEndpoint,
    });
    return createPromiseClient(SpecificQueryService, transport);
  }
}
