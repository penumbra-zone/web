import cn from 'clsx';
import Link from 'next/link';
import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronRight } from 'lucide-react';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';
import { Density } from '@penumbra-zone/ui/Density';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { connectionStore } from '@/shared/model/connection';
import { usePreviousEpochs, BASE_PAGE, BASE_LIMIT, EpochVote } from '../api/use-previous-epochs';
import { useSortableTableHeaders } from './sortable-table-header';
import { Vote } from './vote';

const TABLE_CLASSES = {
  table: {
    default: cn('grid-cols-[200px_1fr_48px]'),
    connected: cn('grid-cols-[200px_1fr_160px_160px_48px]'),
  },
  row: {
    default: cn('col-span-3'),
    connected: cn('col-span-5'),
  },
};

export const PreviousEpochs = observer(() => {
  const [page, setPage] = useState(BASE_PAGE);
  const [limit, setLimit] = useState(BASE_LIMIT);
  const { getTableHeader, sortBy } = useSortableTableHeaders<keyof Required<EpochVote>['sort']>();

  const { connected, address } = connectionStore;
  const tableKey = connected ? 'connected' : 'default';

  const {
    query: { data, isLoading },
    total,
  } = usePreviousEpochs(connected, page, limit, address && bech32mAddress(address), sortBy.key, sortBy.direction);

  const loadingArr = new Array(10).fill({ votes: [] }) as EpochVote[];
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
            {connected && getTableHeader('lpReward', 'My LPs Rewards')}
            {connected && getTableHeader('lpReward', 'My Voting Rewards')}
            <TableCell heading> </TableCell>
          </div>

          {epochs.map((epoch, index) => (
            <Link
              href={isLoading ? '' : `/tournament/${epoch.epoch}`}
              key={index}
              className={cn(
                TABLE_CLASSES.row[tableKey],
                'grid grid-cols-subgrid',
                'hover:bg-action-hoverOverlay transition-colors cursor-pointer',
              )}
            >
              <TableCell cell loading={isLoading}>
                Epoch #{epoch.epoch}
              </TableCell>
              <TableCell cell loading={isLoading}>
                {!isLoading &&
                  epoch.votes.slice(0, 3).map((vote, index) => (
                    <div key={index} className='flex items-center justify-start min-w-[88px] px-1'>
                      <Vote asset={vote.asset} percent={vote.percent} hideFor />
                    </div>
                  ))}
                {!isLoading && epoch.votes.length > 3 && (
                  <Tooltip
                    message={
                      <div className='flex flex-col gap-2'>
                        {epoch.votes.slice(3).map((vote, index) => (
                          <Vote key={index} asset={vote.asset} percent={vote.percent} hideFor />
                        ))}
                      </div>
                    }
                  >
                    <div className='flex items-center justify-start px-3 text-text-primary'>
                      <Text smallTechnical>+{epoch.votes.length - 3}</Text>
                    </div>
                  </Tooltip>
                )}
              </TableCell>
              {connected && (
                <TableCell cell loading={isLoading}>
                  {typeof epoch.lpReward === 'undefined' ? (
                    '–'
                  ) : (
                    <ValueViewComponent valueView={epoch.lpReward} priority='tertiary' />
                  )}
                </TableCell>
              )}
              {connected && (
                <TableCell cell loading={isLoading}>
                  {typeof epoch.votingReward === 'undefined' ? (
                    '–'
                  ) : (
                    <ValueViewComponent valueView={epoch.votingReward} priority='tertiary' />
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
