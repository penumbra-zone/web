import { AssetSelectorValue, isBalancesResponse } from '@penumbra-zone/ui/AssetSelector';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { formatDistanceToNowStrict } from 'date-fns';

export const getAssetId = (value: AssetSelectorValue | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const metadata: Metadata = isBalancesResponse(value)
    ? getMetadataFromBalancesResponse(value)
    : value;

  return metadata.penumbraAssetId?.inner
    ? uint8ArrayToHex(metadata.penumbraAssetId.inner)
    : undefined;
};

export const formatAge = (openingTime: number) => {
  return formatDistanceToNowStrict(openingTime, {
    addSuffix: false,
    roundingMethod: 'floor',
  })
    .replace(/ minutes?$/, 'm')
    .replace(/ hours?$/, 'h')
    .replace(/ days?$/, 'd')
    .replace(/ weeks?$/, 'w')
    .replace(/ months?$/, 'mo');
};
