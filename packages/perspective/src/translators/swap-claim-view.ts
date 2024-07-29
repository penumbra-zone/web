import { Translator } from './types.js';
import { SwapClaimView, SwapClaimView_Opaque } from '@penumbra-zone/protobuf/types';

export const asOpaqueSwapClaimView: Translator<SwapClaimView> = swapClaimView => {
  if (swapClaimView?.swapClaimView.case === 'opaque') {
    return swapClaimView;
  }

  return new SwapClaimView({
    swapClaimView: {
      case: 'opaque',
      value: new SwapClaimView_Opaque({
        swapClaim: swapClaimView?.swapClaimView.value?.swapClaim,
      }),
    },
  });
};
