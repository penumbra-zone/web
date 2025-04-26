import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Card } from '@penumbra-zone/ui/Card';
import { Text } from '@penumbra-zone/ui/Text';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Density } from '@penumbra-zone/ui/Density';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { connectionStore } from '@/shared/model/connection';
import { useSortableTableHeaders } from '../../sortable-table-header';
import type { EpochResultsSortKey } from '../../../server/epoch-results';
import type { MappedGauge } from '../../../server/previous-epochs';
import { useEpochResults } from '../../../api/use-epoch-results';
import { TableRow } from './table-row';

const THRESHOLD = 0.05;
const BASE_LIMIT = 10;

const TABLE_CLASSES = {
  table: {
    default: cn('grid-cols-[1fr_1fr_1fr_1fr]'),
    canVote: cn('grid-cols-[1fr_1fr_1fr_1fr_72px]'),
  },
  row: {
    default: cn('col-span-4'),
    canVote: cn('col-span-5'),
  },
};

export interface CurrentVotingResultsProps {
  epoch: number;
}

export const CurrentVotingResults = observer(({ epoch }: CurrentVotingResultsProps) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(BASE_LIMIT);
  const { getTableHeader, sortBy } = useSortableTableHeaders<EpochResultsSortKey>();

  const { connected } = connectionStore;
  const { data, isLoading } = useEpochResults('epoch-results-round', {
    epoch,
    limit,
    page,
    sortKey: sortBy.key as EpochResultsSortKey,
    sortDirection: sortBy.direction,
  });

  // TODO: `canVote` should be true when connected and has delUM for this epoch
  const canVote = connected;
  const tableKey = canVote ? 'canVote' : 'default';
  const total = data?.total ?? 0;

  const loadingArr = new Array(10).fill({ votes: 0 }) as MappedGauge[];
  const { above, below } = (data?.data ?? []).reduce<{
    above: MappedGauge[];
    below: MappedGauge[];
  }>(
    (accum, current) => {
      if (current.portion >= THRESHOLD) {
        accum.above.push(current);
      } else {
        accum.below.push(current);
      }
      return accum;
    },
    { above: [], below: [] },
  );

  return (
    <Card>
      <div className='flex flex-col p-3 gap-4'>
        <Text xxl color='text.primary'>
          Current Voting Results
        </Text>
        <Density compact>
          <div className={cn('grid h-auto overflow-auto', TABLE_CLASSES.table[tableKey])}>
            <div className={cn('grid grid-cols-subgrid', TABLE_CLASSES.row[tableKey])}>
              <TableCell heading>Asset</TableCell>
              {getTableHeader('portion', 'Percentage of Votes')}
              {getTableHeader('votes', 'Votes Cast')}
              <TableCell heading>Estimated Incentive</TableCell>
              {canVote && <TableCell heading>Vote</TableCell>}
            </div>

            {isLoading &&
              loadingArr.map((item, index) => (
                <TableRow key={index} item={item} loading canVote={canVote} />
              ))}

            {!isLoading && total === 0 && (
              <div className={TABLE_CLASSES.row[tableKey]}>
                <TableCell lastCell>There are no votes in this epoch</TableCell>
              </div>
            )}

            {!isLoading &&
              above.map(item => (
                <TableRow key={item.asset.base} item={item} loading={false} canVote={canVote} />
              ))}

            {!isLoading && !!below.length && (
              <div className={cn(TABLE_CLASSES.row[tableKey])}>
                <TableCell>
                  <Text technical color='text.secondary'>
                    Below threshold ({'<'}
                    {THRESHOLD * 100}%)
                  </Text>
                </TableCell>
              </div>
            )}

            {!isLoading &&
              below.map(item => (
                <TableRow key={item.asset.base} item={item} loading={false} canVote={canVote} />
              ))}

            {!isLoading && total >= limit && (
              <div className={cn('pt-5', TABLE_CLASSES.row[tableKey])}>
                <Pagination
                  totalItems={total}
                  visibleItems={data?.data.length}
                  value={page}
                  limit={limit}
                  onChange={setPage}
                  onLimitChange={setLimit}
                />
              </div>
            )}
          </div>
        </Density>
      </div>
    </Card>
  );
});
