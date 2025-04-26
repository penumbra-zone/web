import { useQuery } from '@tanstack/react-query';
import { SctService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { statusStore } from '@/shared/model/status';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';

export interface RoundBlockInfo {
  startBlock: bigint;
  endBlock?: bigint;
  nextEpoch?: Date;
}

/**
 * Calculates start and end block of the current round with the time of the next block,
 * given the current epoch is finished.
 */
export const useRoundBlockInfo = (epoch?: number) => {
  const query = useQuery<RoundBlockInfo | null>({
    queryKey: ['round-block-info', epoch],
    staleTime: Infinity,
    enabled: !!epoch,
    queryFn: async () => {
      if (!epoch) {
        throw new Error('Epoch is required');
      }

      // TODO: this should be a calculated height from the given epoch
      const height = statusStore.latestKnownBlockHeight;

      const sctService = penumbra.service(SctService);
      const currentEpoch = await sctService.epochByHeight({ height });
      if (!currentEpoch.epoch?.startHeight) {
        return null;
      }

      const prevEpoch = await sctService.epochByHeight({
        height: currentEpoch.epoch.startHeight - 1n,
      });
      if (!prevEpoch.epoch?.startHeight) {
        return null;
      }

      const epochDifference = currentEpoch.epoch.startHeight - prevEpoch.epoch.startHeight;

      const [nextEpoch, currentStartTime, prevStartTime] = await Promise.all([
        sctService.epochByHeight({ height: currentEpoch.epoch.startHeight + epochDifference + 1n }),
        sctService.timestampByHeight({ height: currentEpoch.epoch.startHeight }),
        sctService.timestampByHeight({ height: prevEpoch.epoch.startHeight }),
      ]);

      let nextEpochBlock = nextEpoch.epoch?.startHeight;
      nextEpochBlock =
        nextEpochBlock && nextEpochBlock > currentEpoch.epoch.startHeight
          ? nextEpochBlock - 1n
          : undefined;

      let date: Date | undefined = undefined;
      if (currentStartTime.timestamp && prevStartTime.timestamp) {
        const d1 = currentStartTime.timestamp.toDate();
        const d2 = prevStartTime.timestamp.toDate();
        date = new Date(d1.getTime() + (d1.getTime() - d2.getTime()));
      }

      return {
        startBlock: currentEpoch.epoch.startHeight,
        endBlock: nextEpochBlock,
        nextEpoch: date,
      };
    },
  });

  useRefetchOnNewBlock('round-block-info', query);

  return query;
};
