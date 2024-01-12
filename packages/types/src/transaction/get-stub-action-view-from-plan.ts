import {
  ActionPlan,
  ActionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import {
  AssetId,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import {
  SpendPlan,
  SpendView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';

const getSpendView = (
  spendPlan: SpendPlan,
  metadataByAssetId: Map<AssetId, DenomMetadata>,
): SpendView => {
  if (!spendPlan.note?.address) throw new Error('No address in spend plan');
  if (!spendPlan.note.value?.amount) throw new Error('No amount in spend plan');
  if (!spendPlan.note.value.assetId) throw new Error('No asset ID in spend plan');

  const denomMetadata = metadataByAssetId.get(spendPlan.note.value.assetId);
  if (!denomMetadata) throw new Error('Asset ID in spend plan refers to an unknown asset type');

  return new SpendView({
    spendView: {
      case: 'visible',
      value: {
        note: {
          address: {
            addressView: {
              case: 'opaque',
              value: { address: spendPlan.note.address },
            },
          },
          value: {
            valueView: {
              case: 'knownDenom',
              value: {
                amount: spendPlan.note.value.amount,
                denom: denomMetadata,
              },
            },
          },
        },
      },
    },
  });
};

export const getStubActionViewFromPlan =
  (metadataByAssetId: Map<AssetId, DenomMetadata>) =>
  (actionPlan: ActionPlan): ActionView => {
    switch (actionPlan.action.case) {
      case 'spend':
        return new ActionView({
          actionView: {
            case: 'spend',
            value: getSpendView(actionPlan.action.value, metadataByAssetId),
          },
        });
    }

    return new ActionView({});
  };
