import {
  ActionPlan,
  ActionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import {
  AssetId,
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

const getValueView = (value: Value, metadataByAssetId: Map<AssetId, DenomMetadata>): ValueView => {
  if (!value.assetId) throw new Error('No asset ID in value');
  if (!value.amount) throw new Error('No amount in value');

  const denomMetadata = metadataByAssetId.get(value.assetId);
  if (!denomMetadata) throw new Error('Asset ID in spend plan refers to an unknown asset type');

  return new ValueView({
    valueView: {
      case: 'knownDenom',
      value: {
        amount: value.amount,
        denom: denomMetadata,
      },
    },
  });
};

const getNoteView = (note: Note | undefined, metadataByAssetId: Map<AssetId, DenomMetadata>) => {
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
    value: getValueView(note.value, metadataByAssetId),
  });
};

const getSpendView = (
  spendPlan: SpendPlan,
  metadataByAssetId: Map<AssetId, DenomMetadata>,
): SpendView => {
  if (!spendPlan.note?.address) throw new Error('No address in spend plan');

  return new SpendView({
    spendView: {
      case: 'visible',
      value: {
        note: getNoteView(spendPlan.note, metadataByAssetId),
      },
    },
  });
};

const getOutputView = (
  outputPlan: OutputPlan,
  metadataByAssetId: Map<AssetId, DenomMetadata>,
): OutputView => {
  if (!outputPlan.value) throw new Error('No value in output plan');
  if (!outputPlan.destAddress) throw new Error('No destAddress in output plan');

  return new OutputView({
    outputView: {
      case: 'visible',

      value: {
        note: {
          value: getValueView(outputPlan.value, metadataByAssetId),
          address: { addressView: { case: 'opaque', value: { address: outputPlan.destAddress } } },
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
      case 'output':
        return new ActionView({
          actionView: {
            case: 'output',
            value: getOutputView(actionPlan.action.value, metadataByAssetId),
          },
        });
    }

    return new ActionView({});
  };
