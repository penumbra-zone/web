import { useMemo } from 'react';
import { Text } from '@penumbra-zone/ui/Text';

/**
 * Hook to calculate sync progress and remaining time
 */
const useSyncProgress = (syncHeight: bigint, latestKnownBlockHeight: bigint) => {
  return useMemo(() => {
    const currentHeight = Number(syncHeight);
    const targetHeight = Number(latestKnownBlockHeight);

    if (targetHeight === 0 || currentHeight >= targetHeight) {
      return { formattedTimeRemaining: 'Complete' };
    }

    const remainingBlocks = targetHeight - currentHeight;
    const percentComplete = currentHeight / targetHeight;

    // Estimate based on typical block time (e.g., 5 seconds per block)
    const estimatedSecondsPerBlock = 5;
    const estimatedSecondsRemaining = remainingBlocks * estimatedSecondsPerBlock;

    // Format the time remaining
    if (estimatedSecondsRemaining < 60) {
      return { formattedTimeRemaining: `${Math.round(estimatedSecondsRemaining)}s` };
    } else if (estimatedSecondsRemaining < 3600) {
      const minutes = Math.round(estimatedSecondsRemaining / 60);
      return { formattedTimeRemaining: `${minutes}m` };
    } else {
      const hours = Math.round(estimatedSecondsRemaining / 3600);
      return { formattedTimeRemaining: `${hours}h` };
    }
  }, [syncHeight, latestKnownBlockHeight]);
};

export const RemainingTime = ({
  syncHeight,
  latestKnownBlockHeight,
}: {
  syncHeight: bigint;
  latestKnownBlockHeight: bigint;
}) => {
  const { formattedTimeRemaining } = useSyncProgress(syncHeight, latestKnownBlockHeight);

  return (
    <Text technical as='div'>
      {`(Estimated time remaining: ${formattedTimeRemaining})`}
    </Text>
  );
};
