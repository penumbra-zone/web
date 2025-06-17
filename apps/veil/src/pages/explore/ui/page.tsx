import { ExploreStats } from './stats';
import { ExplorePairs } from './pairs';
import { PenumbraWaves } from './waves';
import { fetchRegistry } from '@/shared/api/fetch-registry';
import { getClientSideEnv } from '@/shared/api/env/getClientSideEnv';
import { fetchStats, Stats } from '../server/stats';
import { deserialize } from '@/shared/utils/serializer';

export const ExplorePage = async () => {
  const statsP = (async () => {
    const raw = await fetchStats();
    return deserialize<Stats>(raw);
  })();
  const registryP = fetchRegistry(getClientSideEnv().PENUMBRA_CHAIN_ID);
  const [stats, registry] = await Promise.all([statsP, registryP]);
  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1062px] mx-auto'>
      <PenumbraWaves />
      <ExploreStats stats={stats} registry={registry} />
      <ExplorePairs />
    </section>
  );
};
