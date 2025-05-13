import { LeaderboardTable } from './table';
import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { useCurrentEpoch } from '@/pages/tournament/api/use-current-epoch';

export const LeaderboardPage = () => {
  const { epoch: currentEpoch } = useCurrentEpoch();

  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1062px] mx-auto'>
      <PenumbraWaves />
      <LeaderboardTable epoch={currentEpoch} />
    </section>
  );
};
