import { Translator } from './types.js';
import { create } from '@bufbuild/protobuf';
import {
  SwapViewSchema,
  SwapView_OpaqueSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import type { SwapView } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

export const asOpaqueSwapView: Translator<SwapView> = swapView => {
  if (swapView?.swapView.case === 'opaque') {
    return swapView;
  }

  return create(SwapViewSchema, {
    swapView: {
      case: 'opaque',
      value: create(SwapView_OpaqueSchema, {
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
