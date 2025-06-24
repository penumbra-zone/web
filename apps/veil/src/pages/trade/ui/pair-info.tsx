import { PairSelector } from './pair-selector';
import { Summary } from './summary';

export const PairInfo = () => {
  return (
    <div className='flex flex-col items-start gap-4 p-4 desktop:flex-row desktop:items-center'>
      <div className='flex h-8 gap-2'>
        <PairSelector />
      </div>
      <Summary />
    </div>
  );
};
