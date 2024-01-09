import type { Impl } from '.';

export const gasPrices: Impl['gasPrices'] = () => {
  /** @todo Replace this stub with real gas prices. */
  return {
    gasPrices: {
      blockSpacePrice: 1n,
      compactBlockSpacePrice: 1n,
      executionPrice: 1n,
      verificationPrice: 1n,
    },
  };
};
