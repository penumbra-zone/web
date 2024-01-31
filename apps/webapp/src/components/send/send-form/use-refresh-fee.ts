import { useCallback, useEffect, useRef } from 'react';
import { sendSelector } from '../../../state/send';
import { useStore } from '../../../state';

const DEBOUNCE_MS = 500;

/**
 * Refreshes the fee in the state when the amount, recipient, selection, or memo
 * changes.
 */
export const useRefreshFee = () => {
  const { amount, recipient, selection, refreshFee } = useStore(sendSelector);
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

  useEffect(debouncedRefreshFee, [amount, recipient, selection, debouncedRefreshFee]);
};
