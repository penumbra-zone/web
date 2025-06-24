import { ExploreStats } from './stats';
import { ExplorePairs } from './pairs';
import { PenumbraWaves } from './waves';

export const ExplorePage = () => {
  return (
    <section className='mx-auto flex max-w-[1062px] flex-col gap-6 p-4'>
      <PenumbraWaves />
      <ExploreStats />
      <ExplorePairs />
    </section>
  );
};
