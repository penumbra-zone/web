import { Box } from '@repo/ui/components/ui/box';
import { SimulateSwapResult } from './simulate-swap-result';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { EstimateButton } from './estimate-button';

const simulateSwapSelector = (state: AllSlices) => ({
  simulateSwap: state.swap.instantSwap.simulateSwap,
  disabled:
    state.swap.txInProgress || !state.swap.amount || state.swap.instantSwap.simulateSwapLoading,
  result: state.swap.instantSwap.simulateSwapResult,
});

export const SimulateSwap = ({ layoutId }: { layoutId: string }) => {
  const { simulateSwap, disabled, result } = useStoreShallow(simulateSwapSelector);

  return (
    <Box
      label='Swap'
      headerContent={<EstimateButton disabled={disabled} onClick={() => void simulateSwap()} />}
      layoutId={layoutId}
    >
      {result && <SimulateSwapResult result={result} />}
    </Box>
  );
};
