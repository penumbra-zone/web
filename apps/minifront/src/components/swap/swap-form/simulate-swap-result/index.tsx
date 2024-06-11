import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { PriceImpact } from './price-impact';
import { Trace } from './trace';
import { motion } from 'framer-motion';
import { SimulateSwapResult as TSimulateSwapResult } from '../../../../state/swap';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { getAmount } from '@penumbra-zone/getters/value-view';

const HIDE = { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' };
const SHOW = { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' };

export const SimulateSwapResult = ({ result }: { result: TSimulateSwapResult }) => {
  const { unfilled, output, priceImpact, traces, metadataByAssetId } = result;

  const hasUnfilled = joinLoHiAmount(getAmount(unfilled)) > 0n;

  return (
    <motion.div layout initial={HIDE} animate={SHOW} exit={HIDE} className='flex flex-col gap-4'>
      <div className='flex items-center gap-1'>
        Filling <ValueViewComponent view={output} size='sm' /> causes a price impact of{' '}
        <PriceImpact amount={priceImpact} />.
        {hasUnfilled && (
          <>
            <ValueViewComponent view={unfilled} size='sm' /> will remain unfilled.
          </>
        )}
      </div>

      {!!traces?.length && (
        <>
          <div className='flex flex-col gap-2 overflow-auto [scrollbar-width:thin]'>
            <div className='inline-flex w-max min-w-full flex-col gap-4'>
              {traces.map((trace, index) => (
                <Trace key={index} trace={trace} metadataByAssetId={metadataByAssetId} />
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};
