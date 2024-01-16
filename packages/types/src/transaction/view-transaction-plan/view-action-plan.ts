import {
  ActionPlan,
  ActionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import {
  DenomMetadata,
  Value,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import {
  Note,
  NoteView,
  OutputPlan,
  OutputView,
  SpendPlan,
  SpendView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { Jsonified } from '../../jsonified';
import { bech32AssetId } from '../../asset';

const getValueView = (
  value: Value | undefined,
  denomMetadataByAssetId: Record<string, Jsonified<DenomMetadata>>,
): ValueView => {
  if (!value) throw new Error('No value to view');
  if (!value.assetId) throw new Error('No asset ID in value');
  if (!value.amount) throw new Error('No amount in value');

  const denomMetadata = denomMetadataByAssetId[bech32AssetId(value.assetId)];
  if (!denomMetadata) throw new Error('Asset ID in spend plan refers to an unknown asset type');

  return new ValueView({
    valueView: {
      case: 'knownDenom',
      value: {
        amount: value.amount,
        denom: DenomMetadata.fromJson(denomMetadata),
      },
    },
  });
};

const getNoteView = (
  note: Note | undefined,
  denomMetadataByAssetId: Record<string, Jsonified<DenomMetadata>>,
) => {
  if (!note) throw new Error('No note to view');
  if (!note.address) throw new Error('No address in note');
  if (!note.value) throw new Error('No value in note');

  return new NoteView({
    address: {
      addressView: {
        case: 'opaque',
        value: { address: note.address },
      },
    },
    value: getValueView(note.value, denomMetadataByAssetId),
  });
};

const getSpendView = (
  spendPlan: SpendPlan,
  denomMetadataByAssetId: Record<string, Jsonified<DenomMetadata>>,
): SpendView => {
  if (!spendPlan.note?.address) throw new Error('No address in spend plan');

  return new SpendView({
    spendView: {
      case: 'visible',
      value: {
        note: getNoteView(spendPlan.note, denomMetadataByAssetId),
      },
    },
  });
};

const getOutputView = (
  outputPlan: OutputPlan,
  denomMetadataByAssetId: Record<string, Jsonified<DenomMetadata>>,
): OutputView => {
  if (!outputPlan.destAddress) throw new Error('No destAddress in output plan');

  return new OutputView({
    outputView: {
      case: 'visible',

      value: {
        note: {
          value: getValueView(outputPlan.value, denomMetadataByAssetId),
          address: {
            addressView: {
              case: 'opaque',
              value: {
                address: outputPlan.destAddress,
              },
            },
          },
        },
      },
    },
  });
};

export const viewActionPlan =
  (denomMetadataByAssetId: Record<string, Jsonified<DenomMetadata>>) =>
  (actionPlan: ActionPlan): ActionView => {
    switch (actionPlan.action.case) {
      case 'spend':
        return new ActionView({
          actionView: {
            case: 'spend',
            value: getSpendView(actionPlan.action.value, denomMetadataByAssetId),
          },
        });
      case 'output':
        return new ActionView({
          actionView: {
            case: 'output',
            value: getOutputView(actionPlan.action.value, denomMetadataByAssetId),
          },
        });
      case 'withdrawal':
        /**
         * Special case -- the `withdrawal` case in the action plan maps to the
         * `ics20Withdrawal` case in the action view.
         *
         * This should probably be renamed for consistency. See
         * https://github.com/penumbra-zone/penumbra/issues/3614.
         */
        return new ActionView({
          actionView: {
            case: 'ics20Withdrawal',
            value: {},
          },
        });
      case undefined:
        throw new Error('No action case in action plan');
      default:
        /**
         * `<ActionViewComponent />` only renders data about the `spend` and
         * `output` cases. For all other cases, it just renders the action name.
         *
         * @todo As we render more data about other action types, add them as
         * cases above.
         */
        return new ActionView({
          actionView: {
            case: actionPlan.action.case,
            value: {},
          },
        });
    }
  };
