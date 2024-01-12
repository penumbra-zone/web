import {
  ActionPlan,
  ActionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

export const getStubActionViewFromPlan =
  (metadataByAssetId: Record<string, DenomMetadata>) =>
  (actionPlan: ActionPlan): ActionView => {
    switch (actionPlan.action.case) {
      case 'spend':
        if (!actionPlan.action.value.note?.address) throw new Error('No address in action plan');

        return new ActionView({
          actionView: {
            case: 'spend',
            value: {
              spendView: {
                case: 'visible',
                value: {
                  note: {
                    address: {
                      addressView: {
                        case: 'opaque',
                        value: { address: actionPlan.action.value.note.address },
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
            },
          },
        });
    }

    return new ActionView({});
  };
