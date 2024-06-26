import { describe, expect, it } from 'vitest';
import { SwapViewComponent } from '.';
import { SwapView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { render } from '@testing-library/react';

describe('<SwapViewComponent />', () => {
  describe('when the swap view is visible', () => {
    const swapView = new SwapView({
      swapView: {
        case: 'visible',
        value: {
          swapPlaintext: {
            claimAddress: {
              inner: new Uint8Array([0, 1, 2, 3]),
            },
            delta1I: {
              hi: 0n,
              lo: 123n,
            },
            delta2I: {
              hi: 0n,
              lo: 456n,
            },
            tradingPair: {
              asset1: {
                inner: new Uint8Array([0, 1, 2, 3]),
              },
              asset2: {
                inner: new Uint8Array([4, 5, 6, 7]),
              },
            },
            claimFee: {
              amount: {
                hi: 0n,
                lo: 123n,
              },
            },
          },
        },
      },
    });

    it('shows the correct fee in upenumbra', () => {
      const { container } = render(<SwapViewComponent value={swapView} />);

      expect(container).toHaveTextContent('123 upenumbra');
    });
  });
});
