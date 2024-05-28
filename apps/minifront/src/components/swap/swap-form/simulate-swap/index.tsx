import { Box } from '@penumbra-zone/ui/components/ui/box';
import { SimulateSwapButton } from './simulate-swap-button';
import { SimulateSwapResult } from '../simulate-swap-result';
import { useStore } from '../../../../state';

export const SimulateSwap = ({ layoutId }: { layoutId: string }) => {
  const result = useStore(state => state.swap.instantSwap.simulateSwapResult);

  return result ? (
    <Box label='Swap' headerContent={<SimulateSwapButton />} layoutId={layoutId}>
      <SimulateSwapResult result={result} />
    </Box>
  ) : (
    <Box label='Swap' headerContent={<SimulateSwapButton />} layoutId={layoutId} />
  );
};
