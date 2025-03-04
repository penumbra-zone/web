import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { USDC_METADATA, PENUMBRA_METADATA, OSMO_METADATA, LPNFT_METADATA } from './metadata';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';

const METADATA_MAP: Record<string, Metadata> = {
  /* eslint-disable @typescript-eslint/no-non-null-assertion -- it's only for storybook purposes */
  [uint8ArrayToBase64(USDC_METADATA.penumbraAssetId!.inner)]: USDC_METADATA,
  [uint8ArrayToBase64(PENUMBRA_METADATA.penumbraAssetId!.inner)]: PENUMBRA_METADATA,
  [uint8ArrayToBase64(OSMO_METADATA.penumbraAssetId!.inner)]: OSMO_METADATA,
  [uint8ArrayToBase64(LPNFT_METADATA.penumbraAssetId!.inner)]: LPNFT_METADATA,
  /* eslint-enable @typescript-eslint/no-non-null-assertion -- enable again */
};

export const registry = {
  tryGetMetadata: (assetId: AssetId): Metadata | undefined => {
    return METADATA_MAP[uint8ArrayToBase64(assetId.inner)];
  },
};
