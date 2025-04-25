import { useEffect, useRef } from 'react';
import { useTournamentSummary } from './use-tournament-summary';

export const useCurrentEpoch = (onChange?: (newEpoch: number) => void) => {
  const { data: summary, isLoading } = useTournamentSummary({
    limit: 1,
    page: 1,
  });

  const epoch = summary?.[0]?.epoch;
  const prevEpoch = useRef(epoch);

  useEffect(() => {
    if (epoch && !prevEpoch.current) {
      prevEpoch.current = epoch;
    } else if (epoch && prevEpoch.current !== epoch) {
      prevEpoch.current = epoch;
      onChange?.(epoch);
    }
  }, [epoch, onChange]);

  return {
    epoch: summary?.[0]?.epoch,
    isLoading,
  };
};
