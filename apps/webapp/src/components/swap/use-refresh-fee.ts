import { useCallback, useEffect, useRef } from 'react';
import { swapSelector } from '../../state/swap';
import { useStore } from '../../state';

const DEBOUNCE_MS = 500;

/**
 * Refreshes the fee in the state when the amount, recipient, selection, or memo
 * changes.
 */
export const useRefreshFee = () => {
  const { amount, assetIn, assetOut, feeTier, refreshFee } = useStore(swapSelector);
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

  useEffect(debouncedRefreshFee, [amount, assetIn, assetOut, feeTier, debouncedRefreshFee]);
};
