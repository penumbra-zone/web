import { AllSlices } from '../../../../../state';
import { useStoreShallow } from '../../../../../utils/use-store-shallow';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { PriceImpact } from './price-impact';

const simulateSwapResultSelector = (state: AllSlices) => ({
  result: state.swap.simulateOutResult,
});

export const SimulateSwapResult = () => {
  const { result } = useStoreShallow(simulateSwapResultSelector);

  if (!result) return null;

  const { unfilled, output, priceImpact } = result;

  return (
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
  );
};
