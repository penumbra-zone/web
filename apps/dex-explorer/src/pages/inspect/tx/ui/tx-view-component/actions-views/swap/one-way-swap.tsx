import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { ArrowRight } from 'lucide-react';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getAmount } from '@penumbra-zone/getters/value-view';

/**
 * Renders a one-way swap (which should be the only kind of swap that ever
 * happens) like this:
 *
 * 1.23INPUT -> 4.56OUTPUT
 */
export const OneWaySwap = ({ input, output }: { input: ValueView; output: ValueView }) => {
  const outputAmount = getAmount.optional(output);

  return (
    <div className='flex items-center gap-2'>
      <ValueViewComponent valueView={input} />

      <ArrowRight />

      <ValueViewComponent valueView={output} showValue={!!outputAmount} />
    </div>
  );
};
