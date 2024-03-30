import { ValueViewComponent } from '../value';
import { ArrowRight } from 'lucide-react';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getAmount, getSymbolFromValueView } from '@penumbra-zone/getters/src/value-view';
import { isZero } from '@penumbra-zone/types/src/amount';

/**
 * Renders a one-way swap (which should be the only kind of swap that ever
 * happens) like this:
 *
 * 1.23INPUT -> 4.56OUTPUT (7.89 unfilled)
 */
export const OneWaySwap = ({ input, output }: { input: ValueView; output: ValueView }) => {
  const outputAmount = getAmount(output);

  return (
    <div className='flex items-center gap-2'>
      <ValueViewComponent view={input} />

      <ArrowRight />

      {isZero(outputAmount) ? getSymbolFromValueView(output) : <ValueViewComponent view={output} />}
    </div>
  );
};
