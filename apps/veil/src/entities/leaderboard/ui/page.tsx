'use client';

import { LPLeaderboard } from './table';
import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { useCurrentEpoch } from '@/pages/tournament/api/use-current-epoch';

export const LeaderboardPage = () => {
  const { epoch: currentEpoch } = useCurrentEpoch();

  return (
    <section className='mx-auto flex max-w-[1062px] flex-col gap-6 p-4'>
      <PenumbraWaves />
      <LPLeaderboard epoch={currentEpoch} />
    </section>
  );
};
