import { AssetMetadataByIdRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { viewClient } from '../clients';
import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getDenomMetadata } from '@penumbra-zone/getters/assets-response';

export const getAllAssets = async (): Promise<Metadata[]> => {
  const responses = await Array.fromAsync(viewClient.assets({}));
  return responses.map(getDenomMetadata);
};

export const getAssetMetadataById = async (assetId: AssetId): Promise<Metadata | undefined> => {
  const req = new AssetMetadataByIdRequest({ assetId });
  const { denomMetadata } = await viewClient.assetMetadataById(req);
  return denomMetadata;
};
