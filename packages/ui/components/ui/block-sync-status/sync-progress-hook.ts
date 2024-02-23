import { useEffect, useRef, useState } from 'react';
import { EWMA } from './ewma';
import humanizeDuration from 'humanize-duration';

/**
 * Custom hook to calculate synchronization speed and estimate the time remaining
 * for a synchronization process to complete, using the Exponential Weighted Moving Average (EWMA)
 * to smooth the speed calculation.
 *
 * @returns An object containing:
 *          - speed: Current speed of synchronization in blocks per second.
 *          - timeRemaining: Estimated time remaining to complete the synchronization, in seconds.
 *          - formattedTimeRemaining: Human-readable string representation (e.g., "13 min, 49 sec").
 *          - confident: A boolean flag indicating whether the speed calculation is considered reliable.
 */
export const useSyncProgress = (
  lastBlockSynced: number,
  lastBlockHeight: number,
  syncUpdatesThreshold = 10, // The number of synchronization updates required before the speed calculation is considered reliable
) => {
  const ewmaSpeedRef = useRef(new EWMA());

  const [speed, setSpeed] = useState<number>(0);
  const lastSyncedRef = useRef<number>(lastBlockSynced);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const [confident, setConfident] = useState<boolean>(false); // Tracks confidence in the speed calculation
  const [syncUpdates, setSyncUpdates] = useState<number>(0); // Tracks the number of synchronization updates

  useEffect(() => {
    const now = Date.now();
    const timeElapsedMs = now - lastUpdateTimeRef.current;
    const blocksSynced = lastBlockSynced - lastSyncedRef.current;

    if (timeElapsedMs > 0 && blocksSynced >= 0) {
      const instantSpeed = (blocksSynced / timeElapsedMs) * 1000; // Calculate speed in blocks per second
      ewmaSpeedRef.current.insert(instantSpeed);
      setSpeed(ewmaSpeedRef.current.value());
      setSyncUpdates(prev => prev + 1); // Increment the number of sync updates
    }

    lastSyncedRef.current = lastBlockSynced;
    lastUpdateTimeRef.current = now;

    // Update confident flag based on the number of sync updates
    if (syncUpdates >= syncUpdatesThreshold && !confident) {
      setConfident(true);
    }
  }, [lastBlockSynced, syncUpdates, syncUpdatesThreshold, confident]);

  const blocksRemaining = lastBlockHeight - lastBlockSynced;
  const timeRemaining = speed > 0 ? blocksRemaining / speed : Infinity;
  const formattedTimeRemaining =
    timeRemaining === Infinity ? '' : humanizeDuration(timeRemaining * 1000, { round: true });

  return { speed, timeRemaining, formattedTimeRemaining, confident };
};
