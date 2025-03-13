import { Translator } from './types.js';
import { create } from '@bufbuild/protobuf';
import {
  SwapClaimViewSchema,
  SwapClaimView_OpaqueSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import type { SwapClaimView } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

export const asOpaqueSwapClaimView: Translator<SwapClaimView> = swapClaimView => {
  if (swapClaimView?.swapClaimView.case === 'opaque') {
    return swapClaimView;
  }

  return create(SwapClaimViewSchema, {
    swapClaimView: {
      case: 'opaque',
      value: create(SwapClaimView_OpaqueSchema, {
        swapClaim: swapClaimView?.swapClaimView.value?.swapClaim,
      }),
    },
  });
};
