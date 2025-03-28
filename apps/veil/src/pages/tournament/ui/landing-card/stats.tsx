import Image from 'next/image';
import { Text } from '@penumbra-zone/ui/Text';
import { pnum } from '@penumbra-zone/types/pnum';
import { round } from '@penumbra-zone/types/round';

export const Stats = ({
  epoch,
  poolAmount,
  poolLPs,
  poolDelegators,
  symbol,
  results,
}: {
  epoch: number;
  poolAmount: number;
  poolLPs: number;
  poolDelegators: number;
  symbol: string;
  results: { symbol: string; amount: number; imgUrl: string }[];
}) => {
  return (
    <>
      <div className='flex justify-between'>
        <Text variant='h3' color='text.primary'>
          Current Epoch
        </Text>
        <div className='rounded-sm bg-base-blackAlt px-2'>
          <div className='font-default text-text2xl font-medium leading-text2xl text-transparent bg-clip-text [background-image:linear-gradient(90deg,rgb(244,156,67),rgb(83,174,168))]'>
            #{epoch}
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <div className='flex justify-between'>
          <Text strong color='text.primary'>
            Incentive Pool
          </Text>
          <Text technical color='text.primary'>
            {pnum(poolAmount).toFormattedString()} {symbol}
          </Text>
        </div>
        <div className='flex w-full h-[6px] bg-base-blackAlt rounded-full justify-between'>
          <div
            className='h-[6px] bg-primary-light rounded-l-full'
            style={{ width: `calc(${(poolLPs / poolAmount) * 100}% - 1px)` }}
          />
          <div
            className='h-[6px] bg-secondary-light rounded-r-full'
            style={{ width: `${(poolDelegators / poolAmount) * 100}%` }}
          />
        </div>
        <div className='flex justify-between'>
          <div className='flex gap-2'>
            <Text technical color='text.primary'>
              LPs
            </Text>
            <Text technical color='primary.light'>
              {pnum(poolLPs).toFormattedString()} {symbol}
            </Text>
            <Text technical color='text.secondary'>
              {round({ value: (poolLPs / poolAmount) * 100, decimals: 0 })}%
            </Text>
          </div>
          <div className='flex gap-2'>
            <Text technical color='text.primary'>
              Delegators
            </Text>
            <Text technical color='secondary.light'>
              {pnum(poolDelegators).toFormattedString()} {symbol}
            </Text>
            <Text technical color='text.secondary'>
              {round({ value: (poolDelegators / poolAmount) * 100, decimals: 0 })}%
            </Text>
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-4'>
        <Text strong color='text.primary'>
          Current Results
        </Text>
        {results.map(asset => (
          <div key={asset.symbol} className='flex gap-3'>
            <Image src={asset.imgUrl} alt={asset.symbol} width={32} height={32} />
            <div className='flex w-full flex-col gap-2'>
              <div className='flex justify-between w-full'>
                <Text technical color='text.primary'>
                  {asset.symbol}
                </Text>
                <Text technical color='text.secondary'>
                  {round({ value: (asset.amount / poolAmount) * 100, decimals: 0 })}%
                </Text>
              </div>
              <div className='flex w-full h-[6px] bg-other-tonalFill5 rounded-full'>
                <div
                  className='h-[6px] bg-secondary-light rounded-full'
                  style={{ width: `calc(${(asset.amount / poolAmount) * 100}% - 1px)` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
