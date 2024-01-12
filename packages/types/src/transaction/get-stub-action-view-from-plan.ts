import {
  ActionPlan,
  ActionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import {
  SpendPlan,
  SpendView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';

const getSpendView = (
  spendPlan: SpendPlan,
  metadataByAssetId: Record<string, DenomMetadata>,
): SpendView => {
  if (!spendPlan.note?.address) throw new Error('No address in spend plan');
  if (!spendPlan.note.value?.amount) throw new Error('No amount in spend plan');
  if (!spendPlan.note.value.assetId) throw new Error('No asset ID in spend plan');

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
                amount: { hi: 1n, lo: 0n },
                denom: {
                  penumbraAssetId: {},
                },
              },
            },
          },
        },
      },
    },
  });
};

export const getStubActionViewFromPlan =
  (metadataByAssetId: Record<string, DenomMetadata>) =>
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
