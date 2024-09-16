import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow.ts';

const limitOrderSelector = (state: AllSlices) => ({
  assetIn: state.swap.assetIn,
  assetOut: state.swap.assetOut,
  amount: state.swap.amount,
  open: state.swap.lpPositions.open,
});

export const LimitOrder = () => {
  const { open } = useStoreShallow(limitOrderSelector);

  return (
    <div>
      <h1>Limit order</h1>
      <button onClick={() => void open()}>SEND LIMIT ORDER</button>
    </div>
  );
};
