'use client';

import { useParams, useRouter } from 'next/navigation';
import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { LPLeaderboard } from '@/entities/leaderboard/ui/table';
import { PagePath } from '@/shared/const/pages';
import { CurrentVotingResults } from './current-voting-results';
import { RoundCard } from './round-card';

export const TournamentRoundPage = () => {
  const params = useParams<{ epoch: string }>();
  const router = useRouter();
  const epoch = Number(params?.epoch);

  if (!params?.epoch && !Number.isNaN(epoch)) {
    router.push(PagePath.Tournament);
    return null;
  }

  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1168px] mx-auto'>
      <PenumbraWaves />
      <RoundCard epoch={epoch} />
      <CurrentVotingResults epoch={epoch} />
      <LPLeaderboard epoch={epoch} />
    </section>
  );
};
