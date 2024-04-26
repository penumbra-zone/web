import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { addAmounts } from '@penumbra-zone/types/src/amount';

const hasMatchingAssetId = (vA: ValueView, vB: ValueView) => {
  return getAssetIdFromValueView(vA).equals(getAssetIdFromValueView(vB));
};

// Use for doing a .reduce() on BalancesResponse[]
export const groupByAsset = (acc: ValueView[], curr: BalancesResponse): ValueView[] => {
  if (!curr.balanceView?.valueView.value?.amount) throw new Error('No amount in value view');

  const grouping = acc.find(v => hasMatchingAssetId(v, curr.balanceView!));

  if (grouping) {
    // Combine the amounts
    if (!grouping.valueView.value?.amount) throw new Error('Grouping without amount');
    grouping.valueView.value.amount = addAmounts(
      grouping.valueView.value.amount,
      curr.balanceView.valueView.value.amount,
    );
  } else {
    // Add a new entry to the array
    // clone so we don't mutate the original
    acc.push(curr.balanceView.clone());
  }

  return acc;
};
