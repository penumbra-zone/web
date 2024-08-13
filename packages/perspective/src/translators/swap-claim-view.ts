import { Translator } from './types.js';
import {
  SwapClaimView,
  SwapClaimView_Opaque,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

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
