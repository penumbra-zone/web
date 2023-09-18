import { SpecificQueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/client/v1alpha1/client_connect';
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import {
  DenomMetadataByIdRequest,
  KeyValueRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/client/v1alpha1/client_pb';
import { base64ToUint8Array } from 'penumbra-types/src/utils';
import { Base64Str } from 'penumbra-types';

interface SpecificQuerierProps {
  grpcEndpoint: string;
}

export class SpecificQuerier {
  private readonly client: PromiseClient<typeof SpecificQueryService>;

  constructor({ grpcEndpoint }: SpecificQuerierProps) {
    this.client = this.createClient(grpcEndpoint);
  }

  async denomMetadata(assetId: Base64Str) {
    const request = new DenomMetadataByIdRequest({
      assetId: { inner: base64ToUint8Array(assetId) },
    });
    const res = await this.client.denomMetadataById(request);
    return res.denomMetadata;
  }

  async keyValue(key: string): Promise<Uint8Array> {
    const keyValueRequest = new KeyValueRequest({ key });
    const keyValue = await this.client.keyValue(keyValueRequest);
    return keyValue.value!.value;
  }

  private createClient(grpcEndpoint: string): PromiseClient<typeof SpecificQueryService> {
    const transport = createGrpcWebTransport({
      baseUrl: grpcEndpoint,
    });
    return createPromiseClient(SpecificQueryService, transport);
  }
}
