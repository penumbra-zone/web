import { Box } from '@penumbra-zone/ui/components/ui/box';
import { AllSlices } from '../../../../state';
import { useStoreShallow } from '../../../../utils/use-store-shallow';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { EstimateButton } from '../estimate-button';
import { EstimatedOutputExplanation } from './estimated-output-explanation';
import { motion } from 'framer-motion';

const outputSelector = (state: AllSlices) => ({
  assetOut: state.swap.assetOut,
  minOutput: state.swap.dutchAuction.minOutput,
  setMinOutput: state.swap.dutchAuction.setMinOutput,
  maxOutput: state.swap.dutchAuction.maxOutput,
  setMaxOutput: state.swap.dutchAuction.setMaxOutput,
  estimate: state.swap.dutchAuction.estimate,
  estimateButtonDisabled:
    state.swap.txInProgress || !state.swap.amount || state.swap.dutchAuction.estimateLoading,
});

export const Output = ({ layoutId }: { layoutId: string }) => {
  const {
    assetOut,
    minOutput,
    setMinOutput,
    maxOutput,
    setMaxOutput,
    estimate,
    estimateButtonDisabled,
  } = useStoreShallow(outputSelector);

  return (
    <Box
      layoutId={layoutId}
      label='Output'
      headerContent={
        <EstimateButton disabled={estimateButtonDisabled} onClick={() => void estimate()} />
      }
    >
      <motion.div layout className='flex flex-col gap-4'>
        <motion.div layout className='flex max-w-[200px] grow flex-col gap-2'>
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
        </motion.div>

        <EstimatedOutputExplanation />
      </motion.div>
    </Box>
  );
};
