import { Translator } from './types.js';
import { SwapView, SwapView_Opaque } from '@penumbra-zone/protobuf/types';

export const asOpaqueSwapView: Translator<SwapView> = swapView => {
  if (swapView?.swapView.case === 'opaque') {
    return swapView;
  }

  return new SwapView({
    swapView: {
      case: 'opaque',
      value: new SwapView_Opaque({
        swap: swapView?.swapView.value?.swap,
        batchSwapOutputData: swapView?.swapView.value?.batchSwapOutputData,
        output1Value: swapView?.swapView.value?.output1?.value,
        output2Value: swapView?.swapView.value?.output2?.value,
        asset1Metadata: swapView?.swapView.value?.asset1Metadata,
        asset2Metadata: swapView?.swapView.value?.asset2Metadata,
      }),
    },
  });
};
