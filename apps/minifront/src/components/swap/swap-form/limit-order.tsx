import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow.ts';

const limitOrderSelector = (state: AllSlices) => ({
  assetIn: state.swap.assetIn,
  assetOut: state.swap.assetOut,
  amount: state.swap.amount,
  onSubmit: state.swap.lpPositions.onSubmit,
});

export const LimitOrder = () => {
  const { onSubmit } = useStoreShallow(limitOrderSelector);

  return (
    <div>
      <h1>Limit order</h1>
      <button onClick={() => void onSubmit()}>SEND LIMIT ORDER</button>
    </div>
  );
};
