import { observer } from 'mobx-react-lite';
import { GradientCard } from '../shared/gradient-card';
import { Explainer } from './explainer';
import { Stats } from './stats';
import { VotingInfo } from '../voting-info';

export const LandingCard = observer(() => {
  const poolDelegators = 2000;
  const poolLPs = 8000;
  const poolAmount = poolLPs + poolDelegators;
  const symbol = 'UM';

  const results = [
    {
      symbol: 'USDC',
      amount: 5000,
      imgUrl:
        'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
    },
    {
      symbol: 'OSMO',
      amount: 4000,
      imgUrl:
        'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
    },
    {
      symbol: 'BTC',
      amount: 3000,
      imgUrl:
        'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
    },
    {
      symbol: 'ATOM',
      amount: 2000,
      imgUrl:
        'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
    },
    {
      symbol: 'XRP',
      amount: 1000,
      imgUrl:
        'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
    },
  ];

  return (
    <GradientCard>
      <div className='flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-12 p-4 md:p-6 lg:p-12'>
        <Explainer />
        <div className='w-full h-[1px] md:w-[1px] md:h-auto bg-other-tonalStroke flex-shrink-0' />
        <div className='flex flex-col w-full md:w-1/2 gap-8'>
          <Stats
            poolAmount={poolAmount}
            poolLPs={poolLPs}
            poolDelegators={poolDelegators}
            symbol={symbol}
            results={results}
          />
          <VotingInfo />
        </div>
      </div>
    </GradientCard>
  );
});
