import { AssetBalance } from './index.ts';
import {
  AssetId,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { addAmounts } from '@penumbra-zone/types';

const getAssetId = (v: ValueView): AssetId => {
  if (v.valueView.case === 'knownAssetId') {
    const assetId = v.valueView.value.metadata?.penumbraAssetId;
    if (!assetId) throw new Error('No asset id in value view');
    return assetId;
  }

  if (v.valueView.case === 'unknownAssetId') {
    const assetId = v.valueView.value.assetId;
    if (!assetId) throw new Error('No asset id in value view');
    return assetId;
  }

  throw new Error('unrecognized value view case');
};

const hasMatchingAssetId = (vA: ValueView, vB: ValueView) => {
  return getAssetId(vA).equals(getAssetId(vB));
};

// Use for doing a .reduce() on AssetBalance[]
export const groupByAsset = (acc: ValueView[], curr: AssetBalance): ValueView[] => {
  if (!curr.value.valueView.value?.amount) throw new Error('No amount in value view');

  const grouping = acc.find(v => hasMatchingAssetId(v, curr.value));

  if (grouping) {
    // Combine the amounts
    if (!grouping.valueView.value?.amount) throw new Error('Grouping without amount');
    grouping.valueView.value.amount = addAmounts(
      grouping.valueView.value.amount,
      curr.value.valueView.value.amount,
    );
  } else {
    // Add a new entry to the array
    // clone so we don't mutate the original
    acc.push(curr.value.clone());
  }

  return acc;
};
