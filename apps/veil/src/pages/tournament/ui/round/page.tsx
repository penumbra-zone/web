'use client';

import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { RoundCard } from './round-card';
import { LeaderboardTable } from '@/entities/leaderboard/ui/table';

export const TournamentRoundPage = () => {
  const startBlock = 1337;
  const endBlock = 1337;

  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1168px] mx-auto'>
      <PenumbraWaves />
      <RoundCard />
      <LeaderboardTable startBlock={startBlock} endBlock={endBlock} />
    </section>
  );
};
