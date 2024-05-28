import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { Input } from '@penumbra-zone/ui/components/ui/input';

const outputSelector = (state: AllSlices) => ({
  assetOut: state.swap.assetOut,
  minOutput: state.swap.dutchAuction.minOutput,
  setMinOutput: state.swap.dutchAuction.setMinOutput,
  maxOutput: state.swap.dutchAuction.maxOutput,
  setMaxOutput: state.swap.dutchAuction.setMaxOutput,
});

export const Output = () => {
  const { assetOut, minOutput, setMinOutput, maxOutput, setMaxOutput } =
    useStoreShallow(outputSelector);

  return (
    <div className='flex max-w-[200px] grow flex-col gap-2'>
      <div className='flex grow items-center gap-2'>
        <span className='text-muted-foreground'>Maximum:</span>
        <Input
          variant='transparent'
          value={maxOutput}
          min={minOutput}
          onChange={e => setMaxOutput(e.target.value)}
          type='number'
          inputMode='decimal'
          step='any'
          className='text-right'
        />

        {assetOut?.symbol && (
          <span className='font-mono text-xs text-muted-foreground'>{assetOut.symbol}</span>
        )}
      </div>

      <div className='flex grow items-center gap-2'>
        <span className='text-muted-foreground'>Minimum:</span>

        <Input
          variant='transparent'
          value={minOutput}
          min={0}
          max={maxOutput}
          onChange={e => setMinOutput(e.target.value)}
          type='number'
          inputMode='decimal'
          step='any'
          className='text-right'
        />

        {assetOut?.symbol && (
          <span className='font-mono text-xs text-muted-foreground'>{assetOut.symbol}</span>
        )}
      </div>
    </div>
  );
};
