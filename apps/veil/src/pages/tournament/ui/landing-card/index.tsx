import { observer } from 'mobx-react-lite';
import { GradientCard } from '../shared/gradient-card';
import { VotingInfo } from '../voting-info';
import { Explainer } from './explainer';
import { Stats } from './stats';

export const LandingCard = observer(() => {
  return (
    <GradientCard>
      <div className='flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-12 p-4 md:p-6 lg:p-12'>
        <Explainer />
        <div className='w-full h-[1px] md:w-[1px] md:h-auto bg-other-tonalStroke flex-shrink-0' />
        <div className='flex flex-col w-full md:w-1/2 gap-8'>
          <Stats />
          <VotingInfo />
        </div>
      </div>
    </GradientCard>
  );
});
