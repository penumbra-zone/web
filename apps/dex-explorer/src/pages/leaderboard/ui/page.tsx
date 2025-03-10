'use server';

import { LeaderboardTable } from './table';
import { PenumbraWaves } from '@/pages/explore/ui/waves';

export const LeaderboardPage = () => {
  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1062px] mx-auto'>
      <PenumbraWaves />
      <LeaderboardTable />
    </section>
  );
};
