import cn from 'clsx';
import Image from 'next/image';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Text } from '@penumbra-zone/ui/Text';
import { round } from '@penumbra-zone/types/round';
import { pnum } from '@penumbra-zone/types/pnum';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { VoteButton } from '@/pages/tournament/ui/round/current-voting-results/vote-button';

export const TableRow = ({
  item,
  loading,
  canVote,
}: {
  item: {
    symbol: string;
    imgUrl: string;
    votes: number;
    estimatedIncentive: ValueView;
    gaugeValue: number;
  };
  canVote: boolean;
  loading: boolean;
}) => {
  return (
    <div className={cn('grid grid-cols-subgrid', canVote ? 'col-span-5' : 'col-span-4')}>
      <TableCell loading={loading}>
        <div className='flex items-center gap-2'>
          <Image src={item.imgUrl} alt={item.symbol} width={32} height={32} />
          <Text technical color='text.primary'>
            {item.symbol}
          </Text>
        </div>
      </TableCell>
      <TableCell loading={loading}>
        <div className='flex items-center gap-2'>
          <div className='flex w-[64px] md:w-[106px] h-[6px] bg-other-tonalFill5 rounded-full'>
            <div
              className='h-[6px] bg-secondary-light rounded-full'
              style={{ width: `${item.gaugeValue * 100}%` }}
            />
          </div>
          <Text technical color='text.secondary'>
            {round({ value: item.gaugeValue * 100, decimals: 0 })}%
          </Text>
        </div>
      </TableCell>
      <TableCell loading={loading}>{pnum(item.votes).toFormattedString()}</TableCell>
      <TableCell loading={loading}>
        <ValueViewComponent valueView={item.estimatedIncentive} />
      </TableCell>
      {canVote && (
        <TableCell loading={loading}>
          {/* TODO: change symbol to `base` after filling with real data */}
          <VoteButton value={item.symbol} />
        </TableCell>
      )}
    </div>
  );
};
