import { useStore } from '../../../../../state';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { PriceImpact } from './price-impact';
import { Trace } from './trace';
import { Box } from '@penumbra-zone/ui/components/ui/box';

export const SimulateSwapResult = () => {
  const result = useStore(state => state.swap.simulateSwapResult);

  if (!result) return null;

  const { unfilled, output, priceImpact, traces, metadataByAssetId } = result;

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-end justify-between gap-2'>
        <div className='flex flex-col items-center'>
          <ValueViewComponent view={output} size='sm' />
          <span className='font-mono text-[12px] italic text-gray-500'>Filled amount</span>
        </div>
        <div className='flex flex-col items-center'>
          <ValueViewComponent view={unfilled} size='sm' />
          <span className='font-mono text-[12px] italic text-gray-500'>Unfilled amount</span>
        </div>
        <div className='flex flex-col items-center'>
          <PriceImpact amount={priceImpact} />
          <span className='font-mono text-[12px] italic text-gray-500'>Price impact</span>
        </div>
      </div>

      {!!traces?.length && (
        <Box label='Routes'>
          <div className='flex flex-col gap-2 overflow-auto [scrollbar-width:thin]'>
            <div className='inline-flex w-max flex-col gap-4'>
              {traces.map((trace, index) => (
                <Trace key={index} trace={trace} metadataByAssetId={metadataByAssetId} />
              ))}
            </div>
          </div>
        </Box>
      )}
    </div>
  );
};
