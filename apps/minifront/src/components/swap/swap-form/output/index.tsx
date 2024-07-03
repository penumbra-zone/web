import { Box } from '@repo/ui/components/ui/box';
import { AllSlices } from '../../../../state';
import { useStoreShallow } from '../../../../utils/use-store-shallow';
import { EstimateButton } from '../estimate-button';
import { EstimatedOutputExplanation } from './estimated-output-explanation';
import { motion } from 'framer-motion';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { NumberInput } from '../../../shared/number-input';

const outputSelector = (state: AllSlices) => ({
  assetOut: state.swap.assetOut,
  minOutput: state.swap.dutchAuction.minOutput,
  setMinOutput: state.swap.dutchAuction.setMinOutput,
  maxOutput: state.swap.dutchAuction.maxOutput,
  setMaxOutput: state.swap.dutchAuction.setMaxOutput,
  estimate: state.swap.dutchAuction.estimate,
  estimateButtonDisabled:
    state.swap.txInProgress || !state.swap.amount || state.swap.dutchAuction.estimateLoading,
  outputStepSize: state.swap.assetOut
    ? 1 / 10 ** getDisplayDenomExponent(state.swap.assetOut)
    : 'any',
  error:
    !!state.swap.dutchAuction.minOutput.length &&
    !!state.swap.dutchAuction.maxOutput.length &&
    Number(state.swap.dutchAuction.minOutput) >= Number(state.swap.dutchAuction.maxOutput)
      ? 'The maximum output must be greater than the minimum output.'
      : undefined,
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
    outputStepSize,
    error,
  } = useStoreShallow(outputSelector);

  return (
    <Box
      layoutId={layoutId}
      label='Gradual Dutch Auction'
      headerContent={
        <EstimateButton disabled={estimateButtonDisabled} onClick={() => void estimate()} />
      }
    >
      <motion.div layout className='flex flex-col gap-4'>
        <EstimatedOutputExplanation />

        <motion.div layout className='flex max-w-[200px] grow flex-col gap-2'>
          <div className='flex grow items-center gap-2'>
            <span className='text-muted-foreground'>Maximum:</span>
            <NumberInput
              variant='transparent'
              value={maxOutput}
              min={minOutput}
              onChange={e => setMaxOutput(e.target.value)}
              inputMode='decimal'
              step={outputStepSize}
              placeholder='0'
              className='text-right'
            />

            {assetOut?.symbol && (
              <span className='font-mono text-xs text-muted-foreground'>{assetOut.symbol}</span>
            )}
          </div>

          <div className='flex grow items-center gap-2'>
            <span className='text-muted-foreground'>Minimum:</span>

            <NumberInput
              variant='transparent'
              value={minOutput}
              min={0}
              max={maxOutput}
              onChange={e => setMinOutput(e.target.value)}
              inputMode='decimal'
              step={outputStepSize}
              placeholder='0'
              className='text-right'
            />

            {assetOut?.symbol && (
              <span className='font-mono text-xs text-muted-foreground'>{assetOut.symbol}</span>
            )}
          </div>
        </motion.div>

        {error && <span className='text-xs text-red'>{error}</span>}
      </motion.div>
    </Box>
  );
};
