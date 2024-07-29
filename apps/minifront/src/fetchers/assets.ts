import { AssetMetadataByIdRequest, AssetId, Metadata } from '@penumbra-zone/protobuf/types';
import { viewClient } from '../clients';
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
