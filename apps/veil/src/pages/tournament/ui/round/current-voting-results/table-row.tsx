import cn from 'clsx';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { Text } from '@penumbra-zone/ui/Text';
import { round } from '@penumbra-zone/types/round';
import { pnum } from '@penumbra-zone/types/pnum';
import type { MappedGauge } from '../../../server/previous-epochs';
import { ProvideLiquidityButton } from '../../shared/provide-liquidity-button';
import { VoteButton } from './vote-button';

export const TableRow = ({
  item,
  loading,
  canVote,
}: {
  item: MappedGauge;
  canVote: boolean;
  loading: boolean;
}) => {
  return (
    <div className={cn('grid grid-cols-subgrid', canVote ? 'col-span-6' : 'col-span-5')}>
      <TableCell loading={loading}>
        {!loading && (
          <div className='flex items-center gap-1'>
            <AssetIcon metadata={item.asset} size='md' />
            <Text smallTechnical color='text.primary'>
              {item.asset.symbol}
            </Text>
          </div>
        )}
      </TableCell>

      <TableCell loading={loading}>
        {!loading && (
          <div className='flex items-center gap-2'>
            <div className='flex w-[64px] md:w-[106px] h-[6px] bg-other-tonal-fill5 rounded-full'>
              <div
                className='h-[6px] bg-secondary-light rounded-full'
                style={{ width: `${item.portion * 100}%` }}
              />
            </div>
            <Text technical color='text.secondary'>
              {round({ value: item.portion * 100, decimals: 0 })}%
            </Text>
          </div>
        )}
      </TableCell>

      <TableCell loading={loading}>{pnum(item.votes).toFormattedString()}</TableCell>

      {/* TODO: implement "estimated incentive" */}
      <TableCell loading={loading}>-</TableCell>

      {canVote && (
        <TableCell loading={loading}>{!loading && <VoteButton value={item} />}</TableCell>
      )}

      <TableCell loading={loading}>
        <ProvideLiquidityButton symbol={item.asset.symbol} />
      </TableCell>
    </div>
  );
};
