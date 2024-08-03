import { SpendView } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { Translator } from './types.js';

export const asOpaqueSpendView: Translator<SpendView> = spendView => {
  if (spendView?.spendView.case === 'opaque') {
    return spendView;
  }

  return new SpendView({
    spendView: {
      case: 'opaque',
      value: spendView?.spendView.value?.spend ? { spend: spendView.spendView.value.spend } : {},
    },
  });
};
