import {
  ActionPlan,
  ActionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import {
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
import { JsonValue } from '@bufbuild/protobuf';
import { uint8ArrayToBase64 } from '../base64';

const getValueView = (
  value: Value,
  denomMetadataByAssetId: Record<string, JsonValue>,
): ValueView => {
  if (!value.assetId) throw new Error('No asset ID in value');
  if (!value.amount) throw new Error('No amount in value');

  const denomMetadata = denomMetadataByAssetId[uint8ArrayToBase64(value.assetId.inner)];
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

const getNoteView = (note: Note | undefined, denomMetadataByAssetId: Record<string, JsonValue>) => {
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
  denomMetadataByAssetId: Record<string, JsonValue>,
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
  denomMetadataByAssetId: Record<string, JsonValue>,
): OutputView => {
  if (!outputPlan.value) throw new Error('No value in output plan');
  if (!outputPlan.destAddress) throw new Error('No destAddress in output plan');

  return new OutputView({
    outputView: {
      case: 'visible',

      value: {
        note: {
          value: getValueView(outputPlan.value, denomMetadataByAssetId),
          address: { addressView: { case: 'opaque', value: { address: outputPlan.destAddress } } },
        },
      },
    },
  });
};

export const getStubActionViewFromPlan =
  (denomMetadataByAssetId: Record<string, JsonValue>) =>
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
    }

    return new ActionView({});
  };
