import { OutputView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { Translator } from './types';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

export const asOpaqueOutputView: Translator<OutputView> = outputView => {
  if (!outputView) return new OutputView();

  if (outputView.outputView.case === 'opaque') return outputView;

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
  if (!outputView) return new OutputView();

  if (outputView.outputView.case === 'opaque') return outputView;

  const addressViewCase = outputView.outputView.value?.note?.address?.addressView.case;
  const address = outputView.outputView.value?.note?.address?.addressView.value?.address;

  if (addressViewCase === 'decoded' && address && (await isControlledAddress(address))) 
    return asOpaqueOutputView(outputView);
   else 
    return outputView;
  
};
