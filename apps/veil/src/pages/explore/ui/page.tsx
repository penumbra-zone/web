import { ExploreStats } from './stats';
import { ExplorePairs } from './pairs';
import { PenumbraWaves } from './waves';
import { fetchRegistry } from '@/shared/api/fetch-registry';
import { getClientSideEnv } from '@/shared/api/env/getClientSideEnv';
import { fetchStats, Stats } from '../server/stats';
import { deserialize } from '@/shared/utils/serializer';
import { fetchDaySummaries } from '@/shared/api/server/summary';

export const ExplorePage = async () => {
  const statsP = (async () => {
    const raw = await fetchStats();
    return deserialize<Stats>(raw);
  })();
  const summariesP = fetchDaySummaries();
  const registryP = fetchRegistry(getClientSideEnv().PENUMBRA_CHAIN_ID);
  const [stats, summaries, registry] = await Promise.all([statsP, summariesP, registryP]);
  return (
    <section className='mx-auto flex max-w-[1062px] flex-col gap-6 p-4'>
      <ExploreStats stats={stats} registry={registry} />
    </section>
  );
};
