import { Box } from '@penumbra-zone/ui/components/ui/box';
import { SimulateSwapButton } from './simulate-swap-button';
import { SimulateSwapResult } from '../simulate-swap-result';

export const SimulateSwap = () => {
  return (
    <Box label='Swap' headerContent={<SimulateSwapButton />}>
      <SimulateSwapResult />
    </Box>
  );
};
