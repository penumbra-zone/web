import type { LqtSummary } from '@/shared/database/schema';
import { pnum } from '@penumbra-zone/types/pnum';
import { round } from '@penumbra-zone/types/round';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { Text } from '@penumbra-zone/ui/Text';
import { shortify } from '@penumbra-zone/types/shortify';
import { useStakingTokenMetadata } from '@/shared/api/registry';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';

export interface IncentivePoolProps {
  summary?: LqtSummary;
  loading: boolean;
}

export const IncentivePool = ({ summary, loading }: IncentivePoolProps) => {
  const symbol = 'UM';

  const { data: stakingToken } = useStakingTokenMetadata();
  const exponent = getDisplayDenomExponent.optional(stakingToken) ?? 6;

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
            {shortify(pnum(summary?.total_rewards).toNumber() / 10 ** exponent)} {symbol}
          </Text>
        )}
      </div>

      <div className='flex h-[6px] w-full justify-between overflow-hidden rounded-full bg-base-black-alt'>
        {loading ? (
          <div className='h-full w-full'>
            <Skeleton />
          </div>
        ) : (
          <>
            <div
              className='h-full bg-primary-light'
              style={
                summary && {
                  width: `calc(${(summary.lp_rewards / summary.total_rewards) * 100}% - 1px)`,
                }
              }
            />
            <div
              className='h-full bg-secondary-light'
              style={
                summary && {
                  width: `${(summary.delegator_rewards / summary.total_rewards) * 100}%`,
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
                {shortify(pnum(summary?.lp_rewards).toNumber() / 10 ** exponent)} {symbol}
              </Text>
              <Text technical color='text.secondary'>
                {summary &&
                  round({
                    value: (summary.lp_rewards / summary.total_rewards) * 100,
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
                {shortify(pnum(summary?.delegator_rewards).toNumber() / 10 ** exponent)} {symbol}
              </Text>
              <Text technical color='text.secondary'>
                {summary &&
                  round({
                    value: (summary.delegator_rewards / summary.total_rewards) * 100,
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
