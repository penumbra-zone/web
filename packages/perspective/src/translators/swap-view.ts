import { Translator } from './types';
import {
  SwapView,
  SwapView_Opaque,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';

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
