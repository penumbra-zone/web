import type { LQTSummary } from '@/shared/database/schema';
import { pnum } from '@penumbra-zone/types/pnum';
import { round } from '@penumbra-zone/types/round';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { Text } from '@penumbra-zone/ui/Text';
import { shortify } from '@penumbra-zone/types/shortify';

export interface IncentivePoolProps {
  summary?: LQTSummary;
  loading: boolean;
}

export const IncentivePool = ({ summary, loading }: IncentivePoolProps) => {
  const symbol = 'UM';

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex justify-between'>
        <Text strong color='text.primary'>
          Incentive Pool
        </Text>

        {loading ? (
          <div className='h-6 w-20'>
            <Skeleton />
          </div>
        ) : (
          <Text technical color='text.primary'>
            {shortify(pnum(summary?.available_rewards).toNumber())} {symbol}
          </Text>
        )}
      </div>

      <div className='flex w-full h-[6px] bg-base-blackAlt rounded-full justify-between overflow-hidden'>
        {loading ? (
          <div className='w-full h-full'>
            <Skeleton />
          </div>
        ) : (
          <>
            <div
              className='h-full bg-primary-light'
              style={
                summary && {
                  width: `calc(${(summary.available_lp_rewards / summary.available_rewards) * 100}% - 1px)`,
                }
              }
            />
            <div
              className='h-full bg-secondary-light'
              style={
                summary && {
                  width: `${(summary.available_delegator_rewards / summary.available_rewards) * 100}%`,
                }
              }
            />
          </>
        )}
      </div>

      <div className='flex justify-between'>
        <div className='flex gap-2'>
          <Text technical color='text.primary'>
            LPs
          </Text>
          {loading ? (
            <div className='h-6 w-28'>
              <Skeleton />
            </div>
          ) : (
            <>
              <Text technical color='primary.light'>
                {shortify(pnum(summary?.available_lp_rewards).toNumber())} {symbol}
              </Text>
              <Text technical color='text.secondary'>
                {summary &&
                  round({
                    value: (summary.available_lp_rewards / summary.available_rewards) * 100,
                    decimals: 0,
                  })}
                %
              </Text>
            </>
          )}
        </div>

        <div className='flex gap-2'>
          <Text technical color='text.primary'>
            Delegators
          </Text>

          {loading ? (
            <div className='h-6 w-28'>
              <Skeleton />
            </div>
          ) : (
            <>
              <Text technical color='secondary.light'>
                {shortify(pnum(summary?.available_delegator_rewards).toNumber())} {symbol}
              </Text>
              <Text technical color='text.secondary'>
                {summary &&
                  round({
                    value: (summary.available_delegator_rewards / summary.available_rewards) * 100,
                    decimals: 0,
                  })}
                %
              </Text>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
