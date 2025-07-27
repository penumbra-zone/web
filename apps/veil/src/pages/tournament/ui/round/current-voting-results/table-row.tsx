import cn from 'clsx';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { Text } from '@penumbra-zone/ui/Text';
import { pnum } from '@penumbra-zone/types/pnum';
import type { MappedGauge } from '../../../server/previous-epochs';
import { ProvideLiquidityButton } from '../../shared/provide-liquidity-button';
import { VoteButton } from './vote-button';
import { formatPercentage, VOTING_THRESHOLD } from '../../vote-dialog/vote-dialog-asset';
import { VotingInfo } from '@/pages/tournament/api/use-voting-info';

export const TableRow = ({
  item,
  loading,
  votingInfo,
  exponent,
}: {
  item: MappedGauge;
  votingInfo: VotingInfo;
  loading: boolean;
  exponent: number;
}) => {
  const isSecondary = item.portion < VOTING_THRESHOLD;

  return (
    <div
      className={cn(
        'grid grid-cols-subgrid',
        votingInfo.case === 'can-vote' ? 'col-span-6' : 'col-span-5',
      )}
    >
      <TableCell loading={loading}>
        {!loading && (
          <div className='flex items-center gap-1'>
            <AssetIcon metadata={item.asset} size='md' />
            <Text smallTechnical color={isSecondary ? 'text.secondary' : 'text.primary'}>
              {item.asset.symbol}
            </Text>
          </div>
        )}
      </TableCell>

      <TableCell loading={loading}>
        {!loading && (
          <div className='flex items-center gap-2'>
            <div className='flex h-[6px] w-[64px] rounded-full bg-other-tonal-fill5 md:w-[106px]'>
              <div
                className={cn(
                  'h-[6px] rounded-full',
                  isSecondary ? 'bg-neutral-light' : 'bg-secondary-light',
                )}
                style={{ width: `${item.portion * 100}%` }}
              />
            </div>
            <Text technical color={isSecondary ? 'text.secondary' : 'text.primary'}>
              {formatPercentage(item.portion)}%
            </Text>
          </div>
        )}
      </TableCell>

      <TableCell loading={loading}>
        <Text smallTechnical color={isSecondary ? 'text.secondary' : 'text.primary'}>
          {pnum(item.votes / 10 ** exponent).toFormattedString()}
        </Text>
      </TableCell>

      {/* TODO: implement "estimated incentive" */}
      <TableCell loading={loading}>-</TableCell>

      {votingInfo.case === 'can-vote' && (
        <TableCell loading={loading}>
          {!loading && <VoteButton ability={votingInfo.ability} value={item} />}
        </TableCell>
      )}

      <TableCell loading={loading}>
        <ProvideLiquidityButton symbol={item.asset.symbol} primary={!isSecondary} />
      </TableCell>
    </div>
  );
};
