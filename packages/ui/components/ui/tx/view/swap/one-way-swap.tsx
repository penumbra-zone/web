import { SwapView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { ValueViewComponent } from '../value';
import { getOneWaySwapValues } from '@penumbra-zone/types/src/swap';
import { ArrowRight } from 'lucide-react';

/**
 * Renders a one-way swap (which should be the only kind of swap that ever
 * happens) like this:
 *
 * 1.23INPUT -> 4.56OUTPUT (7.89 unfilled)
 */
export const OneWaySwap = ({ swapView }: { swapView: SwapView }) => {
  const { input, output, unfilled } = getOneWaySwapValues(swapView);

  return (
    <div className='flex items-center gap-2'>
      <ValueViewComponent view={input} />

      <ArrowRight />

      <ValueViewComponent view={output} />

      {unfilled && (
        <>
          <ValueViewComponent view={unfilled} /> unfilled
        </>
      )}
    </div>
  );
};
