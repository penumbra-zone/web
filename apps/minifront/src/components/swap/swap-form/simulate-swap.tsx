import { Box } from '@penumbra-zone/ui/components/ui/box';
import { SimulateSwapResult } from './simulate-swap-result';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { EstimateButton } from './estimate-button';

const simulateSwapSelector = (state: AllSlices) => ({
  loading: state.swap.instantSwap.simulateSwapLoading,
  simulateSwap: state.swap.instantSwap.simulateSwap,
  disabled:
    state.swap.txInProgress || !state.swap.amount || state.swap.instantSwap.simulateSwapLoading,
  result: state.swap.instantSwap.simulateSwapResult,
});

export const SimulateSwap = ({ layoutId }: { layoutId: string }) => {
  const { loading, simulateSwap, disabled, result } = useStoreShallow(simulateSwapSelector);

  return (
    <Box
      label='Swap'
      headerContent={
        <EstimateButton disabled={disabled} loading={loading} onClick={() => void simulateSwap()} />
      }
      layoutId={layoutId}
    >
      {result && <SimulateSwapResult result={result} />}
    </Box>
  );
};
