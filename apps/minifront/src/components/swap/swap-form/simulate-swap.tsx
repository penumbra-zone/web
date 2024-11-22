import { Box } from '@penumbra-zone/ui-deprecated/components/ui/box';
import { SimulateSwapResult } from './simulate-swap-result';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { EstimateButton } from './estimate-button';
import { useEffect } from 'react';

const simulateSwapSelector = (state: AllSlices) => ({
  simulateSwap: state.swap.instantSwap.simulateSwap,
  resetSimulateSwap: state.swap.instantSwap.reset,
  disabled:
    state.swap.txInProgress || !state.swap.amount || state.swap.instantSwap.simulateSwapLoading,
  result: state.swap.instantSwap.simulateSwapResult,
  amount: state.swap.amount,
});

// Automatically trigger swap simulation on user input
export const SimulateSwap = ({ layoutId }: { layoutId: string }) => {
  const { simulateSwap, resetSimulateSwap, disabled, result, amount } =
    useStoreShallow(simulateSwapSelector);

  useEffect(() => {
    if (!disabled && amount && parseFloat(amount) > 0) {
      // Prevents re-triggering the swap simulation if it's already computed
      if (!result) {
        void simulateSwap();
      }
    } else if (result) {
      // Reset simulation
      resetSimulateSwap();
    }
  }, [simulateSwap, resetSimulateSwap, disabled, result, amount]);

  return (
    <Box
      label='Instant Swap'
      headerContent={<EstimateButton disabled={disabled} onClick={() => void simulateSwap()} />}
      layoutId={layoutId}
    >
      {result && <SimulateSwapResult result={result} />}
    </Box>
  );
};
