import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AssetMetadataByIdRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { penumbra } from '../const/penumbra';
import { ViewService } from '@penumbra-zone/protobuf';
import { queryClient } from '../const/queryClient';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';

const assetMetadataQueryFn = async (assetId: AssetId) => {
  const req = new AssetMetadataByIdRequest({ assetId });
  const { denomMetadata } = await penumbra.service(ViewService).assetMetadataById(req);
  return denomMetadata;
};

const getAssetMetadataQueryOptions = (assetId: AssetId) => ({
  queryKey: ['assetMetadata', uint8ArrayToBase64(assetId.inner)],
  queryFn: () => assetMetadataQueryFn(assetId),
  staleTime: Infinity,
});

/**
 * Fetch query (non-hook) that retrieves and caches asset metadata for a given
 * asset ID from the Penumbra view service.
 */
export const getAssetMetadataById = async (assetId: AssetId): Promise<Metadata | undefined> => {
  return queryClient.fetchQuery(getAssetMetadataQueryOptions(assetId));
};
