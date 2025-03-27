import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Text } from '@penumbra-zone/ui/Text';
import Image from 'next/image';
import { round } from '@penumbra-zone/types/round';
import { pnum } from '@penumbra-zone/types/pnum';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Button } from '@penumbra-zone/ui/Button';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export const TableRow = ({
  item,
  totalVotes,
}: {
  item: { symbol: string; imgUrl: string; votes: number; estimatedIncentive: ValueView };
  totalVotes: number;
}) => {
  return (
    <div key={item.symbol} className='grid grid-cols-subgrid col-span-5'>
      <TableCell>
        <div className='flex items-center gap-2'>
          <Image src={item.imgUrl} alt={item.symbol} width={32} height={32} />
          <Text technical color='text.primary'>
            {item.symbol}
          </Text>
        </div>
      </TableCell>
      <TableCell>
        <div className='flex items-center gap-2'>
          <div className='flex min-w-[106px] h-[6px] bg-other-tonalFill5 rounded-full'>
            <div
              className='h-[6px] bg-secondary-light rounded-full'
              style={{ width: `${(item.votes / totalVotes) * 100}%` }}
            />
          </div>
          <Text technical color='text.secondary'>
            {round({ value: (item.votes / totalVotes) * 100, decimals: 0 })}%
          </Text>
        </div>
      </TableCell>
      <TableCell>{pnum(item.votes).toFormattedString()}</TableCell>
      <TableCell>
        <ValueViewComponent valueView={item.estimatedIncentive} />
      </TableCell>
      <TableCell>
        <Button actionType='default' density='slim'>
          Vote
        </Button>
      </TableCell>
    </div>
  );
};
