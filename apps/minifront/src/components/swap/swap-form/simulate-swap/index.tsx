import { Box } from '@penumbra-zone/ui/components/ui/box';
import { SimulateSwapButton } from './simulate-swap-button';
import { SimulateSwapResult } from '../simulate-swap-result';
import { useStore } from '../../../../state';
import { useId } from 'react';

export const SimulateSwap = () => {
  const layoutId = useId();
  const result = useStore(state => state.swap.instantSwap.simulateSwapResult);

  return result ? (
    <Box label='Swap' headerContent={<SimulateSwapButton />} layoutId={layoutId}>
      <SimulateSwapResult result={result} />
    </Box>
  ) : (
    <Box label='Swap' headerContent={<SimulateSwapButton />} layoutId={layoutId} />
  );
};
