import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';

const LQT_MARKETING_URL = 'https://penumbra.zone/tournament';

export const Explainer = () => {
  return (
    <div className='flex w-full flex-col gap-12 md:w-1/2'>
      <Text variant='h1' color='text.primary'>
        Liquidity Tournament
      </Text>
      <div className='flex flex-col gap-10'>
        <div className='flex items-start gap-2'>
          <Image
            src='/assets/lqt-delegators.svg'
            alt='Delegators'
            width={64}
            height={64}
            className='mr-6'
          />
          <div className='flex flex-col gap-2'>
            <Text variant='large' color='text.primary'>
              Delegate UM
            </Text>
            <Text variant='small' color='text.secondary'>
              Delegate UM using Prax to vote on which assets should receive incentives from the
              protocol. Delegators receive rewards for participating in the voting process.
            </Text>
          </div>
        </div>
        <div className='flex items-start gap-2'>
          <Image
            src='/assets/lqt-lps.svg'
            alt='Liquidity Providers'
            width={64}
            height={64}
            className='mr-6'
          />
          <div className='flex flex-col gap-2'>
            <Text variant='large' color='text.primary'>
              Provide Liquidity
            </Text>
            <Text variant='small' color='text.secondary'>
              Provide the best liquidity in response to delegator votes in order to deepen what is
              available for trading. LPs earn rewards based on how much their positions are used.
            </Text>
          </div>
        </div>
        <div className='flex items-start gap-2'>
          <Image
            src='/assets/lqt-rewards.svg'
            alt='Automatic Rewards Distribution'
            width={64}
            height={64}
            className='mr-6'
          />
          <div className='flex flex-col gap-2'>
            <Text variant='large' color='text.primary'>
              Receive Rewards Automatically
            </Text>
            <Text variant='small' color='text.secondary'>
              Delegators receive rewards directly to their balance. Liquidity Providers receive
              rewards distributed to their LP reserves and can withdraw when managing positions.
            </Text>
          </div>
        </div>

        {/* eslint-disable-next-line react/jsx-no-target-blank -- we want analytics to see referrers */}
        <a href={LQT_MARKETING_URL} target='_blank'>
          <Button icon={ExternalLink} priority='primary'>
            Learn More
          </Button>
        </a>
      </div>
    </div>
  );
};
