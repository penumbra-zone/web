import { PairSelector } from './pair-selector';
import { Summary } from './summary';

export const PairInfo = () => {
  return (
    <div className='flex flex-col items-start desktop:items-center desktop:flex-row p-4 gap-4'>
      <div className='flex gap-2 h-8'>
        <PairSelector />
      </div>
      <Summary />
    </div>
  );
};
