import Image from 'next/image';
import { Text } from '@penumbra-zone/ui/Text';

export const Explainer = () => {
  return (
    <div className='flex flex-col w-full md:w-1/2 gap-12'>
      <Text variant='h1' color='text.primary'>
        Liquidity Tournament
      </Text>
      <div className='flex flex-col gap-10'>
        <div className='flex gap-2 items-start'>
          <Image
            src='/assets/lqt-delegators.svg'
            alt='Delegators'
            width={64}
            height={64}
            className='mr-6'
          />
          <div className='flex flex-col gap-2'>
            <Text variant='large' color='text.primary'>
              Delegators
            </Text>
            <Text variant='small' color='text.secondary'>
              Stake UM to vote on which assets should receive incentives. Earn rewards for
              participating, regardless of their vote choice.
            </Text>
          </div>
        </div>
        <div className='flex gap-2 items-start'>
          <Image
            src='/assets/lqt-lps.svg'
            alt='Liquidity Providers'
            width={64}
            height={64}
            className='mr-6'
          />
          <div className='flex flex-col gap-2'>
            <Text variant='large' color='text.primary'>
              Liquidity Providers
            </Text>
            <Text variant='small' color='text.secondary'>
              Provide liquidity on Penumbra Veil to facilitate trading. Earn rewards from trade
              volume in LPs that hold voted assets.
            </Text>
          </div>
        </div>
        <div className='flex gap-2 items-start'>
          <Image
            src='/assets/lqt-rewards.svg'
            alt='Automatic Rewards Distribution'
            width={64}
            height={64}
            className='mr-6'
          />
          <div className='flex flex-col gap-2'>
            <Text variant='large' color='text.primary'>
              Automatic Rewards Distribution
            </Text>
            <Text variant='small' color='text.secondary'>
              Delegators receive rewards directly to the balance, and Liquidity Providers get
              rewards in LP reserves and withdraw when managing positions.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};
