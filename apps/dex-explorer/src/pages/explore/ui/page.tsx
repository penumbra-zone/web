import { ExploreStats } from './stats';
import { ExplorePairs } from './pairs';
import { PenumbraWaves } from './waves';

export const ExplorePage = () => {
  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1062px] mx-auto'>
      <PenumbraWaves />
      <ExploreStats />
      <ExplorePairs />
    </section>
  );
};
