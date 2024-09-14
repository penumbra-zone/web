import { useStoreShallow } from '../../../utils/use-store-shallow.ts';
import { swapErrorSelector } from '../../../state/swap';

export const TokenInputError = () => {
  const {
    incorrectDecimalErr,
    amountMoreThanBalanceErr,
    swappableAssetsError,
    balanceResponsesError,
  } = useStoreShallow(swapErrorSelector);

  const error =
    amountMoreThanBalanceErr ||
    incorrectDecimalErr ||
    swappableAssetsError ||
    balanceResponsesError;

  if (!error) {
    return null;
  }

  return <div className='ml-auto text-xs text-red-400'>{error}</div>;
};
