import { LeaderboardTable } from './table';
import { PenumbraWaves } from '@/pages/explore/ui/waves';

// eslint-disable-next-line @typescript-eslint/require-await -- next wills it
export const LeaderboardPage = async () => {
  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1062px] mx-auto'>
      <PenumbraWaves />
      <LeaderboardTable />
    </section>
  );
};
