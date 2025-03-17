import { OutputViewSchema } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { create } from '@bufbuild/protobuf';
import type { OutputView } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { Translator } from './types.js';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

export const asOpaqueOutputView: Translator<OutputView> = outputView => {
  if (!outputView) {
    return create(OutputViewSchema);
  }

  if (outputView.outputView.case === 'opaque') {
    return outputView;
  }

  return create(OutputViewSchema, {
    outputView: {
      case: 'opaque',
      value: outputView.outputView.value?.output
        ? {
            output: outputView.outputView.value.output,
          }
        : {},
    },
  });
};

export const asReceiverOutputView: Translator<
  OutputView,
  Promise<OutputView>,
  { isControlledAddress: (address: Address) => Promise<boolean> }
> = async (outputView, { isControlledAddress }) => {
  if (!outputView) {
    return create(OutputViewSchema);
  }

  if (outputView.outputView.case === 'opaque') {
    return outputView;
  }

  const addressViewCase = outputView.outputView.value?.note?.address?.addressView.case;
  const address = outputView.outputView.value?.note?.address?.addressView.value?.address;

  if (addressViewCase === 'decoded' && address && (await isControlledAddress(address))) {
    return asOpaqueOutputView(outputView);
  } else {
    return outputView;
  }
};
