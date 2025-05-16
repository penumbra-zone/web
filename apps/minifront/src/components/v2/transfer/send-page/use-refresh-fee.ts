import { useCallback, useEffect, useRef } from 'react';
import { AllSlices } from '../../../../state';
import { useStoreShallow } from '../../../../utils/use-store-shallow';

const DEBOUNCE_MS = 500;

const useRefreshFeeSelector = (state: AllSlices) => ({
  amount: state.send.amount,
  feeTier: state.send.feeTier,
  recipient: state.send.recipient,
  selection: state.send.selection,
  refreshFee: state.send.refreshFee,
});

/**
 * Refreshes the fee in the state when the amount, recipient, selection, or memo
 * changes.
 */
export const useRefreshFee = () => {
  const { amount, feeTier, recipient, selection, refreshFee } =
    useStoreShallow(useRefreshFeeSelector);
  const timeoutId = useRef<number | null>(null);

  const debouncedRefreshFee = useCallback(() => {
    if (timeoutId.current) {
      window.clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }

    timeoutId.current = window.setTimeout(() => {
      timeoutId.current = null;
      void refreshFee();
    }, DEBOUNCE_MS);
  }, [refreshFee]);

  useEffect(debouncedRefreshFee, [amount, feeTier, recipient, selection, debouncedRefreshFee]);
};
