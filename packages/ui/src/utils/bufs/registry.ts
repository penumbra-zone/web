import { AssetId, Metadata, Denom } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  USDC_METADATA,
  PENUMBRA_METADATA,
  OSMO_METADATA,
  LPNFT_METADATA,
  DELEGATION_TOKEN_METADATA,
} from './metadata';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';

const METADATA_MAP: Record<string, Metadata> = {
  /* eslint-disable @typescript-eslint/no-non-null-assertion -- it's only for storybook purposes */
  [uint8ArrayToBase64(USDC_METADATA.penumbraAssetId!.inner)]: USDC_METADATA,
  [uint8ArrayToBase64(PENUMBRA_METADATA.penumbraAssetId!.inner)]: PENUMBRA_METADATA,
  [uint8ArrayToBase64(OSMO_METADATA.penumbraAssetId!.inner)]: OSMO_METADATA,
  [uint8ArrayToBase64(LPNFT_METADATA.penumbraAssetId!.inner)]: LPNFT_METADATA,
  [uint8ArrayToBase64(DELEGATION_TOKEN_METADATA.penumbraAssetId!.inner)]: DELEGATION_TOKEN_METADATA,

  // Map by denom
  [USDC_METADATA.base]: USDC_METADATA,
  [PENUMBRA_METADATA.base]: PENUMBRA_METADATA,
  [OSMO_METADATA.base]: OSMO_METADATA,
  [LPNFT_METADATA.base]: LPNFT_METADATA,
  [DELEGATION_TOKEN_METADATA.base]: DELEGATION_TOKEN_METADATA,
  /* eslint-enable @typescript-eslint/no-non-null-assertion -- enable again */
};

export const isDenom = (value?: Denom | AssetId): value is Denom =>
  value?.getType().typeName === Denom.typeName;

export const registry = {
  tryGetMetadata: (id: AssetId | Denom): Metadata | undefined => {
    return isDenom(id) ? METADATA_MAP[id.denom] : METADATA_MAP[uint8ArrayToBase64(id.inner)];
  },
};
