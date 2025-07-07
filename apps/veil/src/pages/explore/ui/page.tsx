import { ExplorePairs } from './pairs';
import { PenumbraWaves } from './waves';
import { fetchStats } from '../server/stats';
import { fetchDaySummaries } from '@/shared/api/server/summary';

export const ExplorePage = async () => {
  const [stats, summaries] = await Promise.all([fetchStats(), fetchDaySummaries()]);
  return (
    <section className='mx-auto flex max-w-[1062px] flex-col gap-6 p-4'>
      <PenumbraWaves />
      <ExplorePairs summaries={summaries} stats={stats} />
    </section>
  );
};
