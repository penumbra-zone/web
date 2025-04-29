import cn from 'clsx';
import Link from 'next/link';
import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronRight } from 'lucide-react';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';
import { Density } from '@penumbra-zone/ui/Density';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { connectionStore } from '@/shared/model/connection';
import { useStakingTokenMetadata } from '@/shared/api/registry';
import { usePreviousEpochs, BASE_PAGE, BASE_LIMIT } from '../api/use-previous-epochs';
import type { PreviousEpochData } from '../server/previous-epochs';
import { useSortableTableHeaders } from './sortable-table-header';
import { usePersonalRewards } from '../api/use-personal-rewards';
import { Vote } from './vote';
import { pnum } from '@penumbra-zone/types/pnum';

const TABLE_CLASSES = {
  table: {
    default: cn('grid-cols-[200px_1fr_48px]'),
    connected: cn('grid-cols-[200px_1fr_200px_48px]'),
  },
  row: {
    default: cn('col-span-3'),
    connected: cn('col-span-4'),
  },
};

interface PreviousEpochsRowProps {
  row: PreviousEpochData;
  isLoading: boolean;
  className: string;
  connected: boolean;
}

const PreviousEpochsRow = observer(
  ({ row, isLoading, className, connected }: PreviousEpochsRowProps) => {
    const { subaccount } = connectionStore;
    const { data: rewards, isLoading: rewardsLoading } = usePersonalRewards(subaccount, row.epoch);
    const { data: stakingToken } = useStakingTokenMetadata();

    return (
      <Link
        href={isLoading ? '' : `/tournament/${row.epoch}`}
        className={cn(
          className,
          'grid grid-cols-subgrid',
          'hover:bg-action-hoverOverlay transition-colors cursor-pointer',
        )}
      >
        <TableCell cell loading={isLoading}>
          Epoch #{row.epoch}
        </TableCell>
        <TableCell cell loading={isLoading}>
          {!isLoading && !row.gauge.length && '-'}
          {!isLoading &&
            row.gauge.slice(0, 3).map((vote, index) => (
              <div key={index} className='flex items-center justify-start min-w-[88px] px-1'>
                <Vote asset={vote.asset} percent={vote.portion} hideFor />
              </div>
            ))}
          {!isLoading && row.gauge.length > 3 && (
            <Tooltip
              message={
                <div className='flex flex-col gap-2'>
                  {row.gauge.slice(3).map((vote, index) => (
                    <Vote key={index} asset={vote.asset} percent={vote.portion} hideFor />
                  ))}
                </div>
              }
            >
              <div className='flex items-center justify-start px-3 text-text-primary'>
                <Text smallTechnical>+{row.gauge.length - 3}</Text>
              </div>
            </Tooltip>
          )}
        </TableCell>
        {connected && (
          <TableCell cell loading={isLoading || rewardsLoading}>
            {rewards?.data.find(r => BigInt(r.epoch) === BigInt(row.epoch)) && stakingToken && (
              <ValueViewComponent
                valueView={
                  new ValueView({
                    valueView: {
                      case: 'knownAssetId',
                      value: {
                        amount: pnum(
                          rewards.data.find(r => BigInt(r.epoch) === BigInt(row.epoch))?.reward,
                        ).toAmount(),
                        metadata: stakingToken,
                      },
                    },
                  })
                }
                priority='tertiary'
              />
            )}
          </TableCell>
        )}
        <TableCell cell loading={isLoading}>
          <Density slim>
            <Button iconOnly icon={ChevronRight}>
              Go to voting reward information
            </Button>
          </Density>
        </TableCell>
      </Link>
    );
  },
);

export const PreviousEpochs = observer(() => {
  const [page, setPage] = useState(BASE_PAGE);
  const [limit, setLimit] = useState(BASE_LIMIT);
  const { getTableHeader, sortBy } = useSortableTableHeaders<'epoch'>();

  const { connected } = connectionStore;
  const tableKey = connected ? 'connected' : 'default';

  const {
    query: { isLoading },
    data,
    total,
  } = usePreviousEpochs(connected, page, limit, sortBy.key, sortBy.direction);

  const loadingArr = new Array(10).fill({ votes: [] }) as PreviousEpochData[];
  const epochs = data ?? loadingArr;

  const onLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(BASE_PAGE);
  };

  return (
    <div className='flex flex-col gap-6 p-6 w-full rounded-lg bg-other-tonalFill5 backdrop-blur-lg'>
      <Text xxl color='text.primary'>
        Previous epochs
      </Text>
      <Density compact>
        <div className={cn('grid', TABLE_CLASSES.table[tableKey])}>
          <div className={cn('grid grid-cols-subgrid', TABLE_CLASSES.row[tableKey])}>
            {getTableHeader('epoch', 'Epoch')}
            <TableCell heading>Votes Summary</TableCell>
            {connected && <TableCell heading>My Voting Rewards</TableCell>}
            <TableCell heading> </TableCell>
          </div>

          {epochs.map(epoch => (
            <PreviousEpochsRow
              key={epoch.epoch}
              isLoading={isLoading}
              row={epoch}
              connected={connected}
              className={TABLE_CLASSES.row[tableKey]}
            />
          ))}
        </div>
      </Density>

      {!isLoading && total >= BASE_LIMIT && (
        <Pagination
          totalItems={total}
          visibleItems={epochs.length}
          value={page}
          limit={limit}
          onChange={setPage}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
});
