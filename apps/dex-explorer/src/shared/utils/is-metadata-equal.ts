import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

/**
 * Compares two asset Metadata objects by penumbraAssetId.
 *
 * This function is preferable over simple `metadata.symbol` comparison since there could potentially be
 * two or more assets with the same symbol but different `penumbraAssetId`. For example, for native
 * asset within Penumbra and the bridged (ibc-ed) asset.
 * */
export const isMetadataEqual = (a: Metadata, b: Metadata): boolean => {
  if (a.penumbraAssetId && b.penumbraAssetId) {
    return a.penumbraAssetId.equals(b.penumbraAssetId);
  }

  return a.symbol === b.symbol;
};
