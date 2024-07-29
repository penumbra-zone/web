import { OutputView, Address } from '@penumbra-zone/protobuf/types';
import { Translator } from './types.js';

export const asOpaqueOutputView: Translator<OutputView> = outputView => {
  if (!outputView) {
    return new OutputView();
  }

  if (outputView.outputView.case === 'opaque') {
    return outputView;
  }

  return new OutputView({
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
    return new OutputView();
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
