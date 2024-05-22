import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { Input } from '@penumbra-zone/ui/components/ui/input';

const priceSelector = (state: AllSlices) => ({
  assetIn: state.dutchAuction.assetIn,
  assetOut: state.dutchAuction.assetOut,
  setAssetOut: state.dutchAuction.setAssetOut,
  minOutput: state.dutchAuction.minOutput,
  setMinOutput: state.dutchAuction.setMinOutput,
  maxOutput: state.dutchAuction.maxOutput,
  setMaxOutput: state.dutchAuction.setMaxOutput,
});

export const Price = () => {
  const { minOutput, setMinOutput, maxOutput, setMaxOutput } = useStoreShallow(priceSelector);

  return (
    <div className='flex grow items-center gap-4'>
      <div className='flex grow flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground'>Min:</span>
          <Input
            variant='transparent'
            value={minOutput}
            min={0}
            max={maxOutput}
            onChange={e => setMinOutput(e.target.value)}
            type='number'
            inputMode='decimal'
          />
        </div>

        <div className='flex grow items-center gap-2'>
          <span className='text-muted-foreground'>Max:</span>
          <Input
            variant='transparent'
            value={maxOutput}
            min={minOutput}
            onChange={e => setMaxOutput(e.target.value)}
            type='number'
            inputMode='numeric'
          />
        </div>
      </div>
    </div>
  );
};
