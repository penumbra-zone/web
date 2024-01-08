import type { Impl } from '.';

import { GasPricesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';

export const gasPrices: Impl['gasPrices'] = () => {
  return new GasPricesResponse({
    gasPrices: new GasPrices({
      blockSpacePrice: 1n,
      compactBlockSpacePrice: 1n,
      executionPrice: 1n,
      verificationPrice: 1n,
    }),
  });
};
