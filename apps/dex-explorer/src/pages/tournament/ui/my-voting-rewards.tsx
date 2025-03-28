import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronRight } from 'lucide-react';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Density } from '@penumbra-zone/ui/Density';
import { Button } from '@penumbra-zone/ui/Button';
import { useVotingRewards, BASE_PAGE, BASE_LIMIT, VotingReward } from '../api/use-voting-rewards';
import { Vote } from './vote';
import { useSortableTableHeaders } from './sortable-table-header';

export const MyVotingRewards = observer(() => {
  const [page, setPage] = useState(BASE_PAGE);
  const [limit, setLimit] = useState(BASE_LIMIT);
  const { getTableHeader, sortBy } =
    useSortableTableHeaders<keyof Required<VotingReward>['sort']>();

  const {
    query: { data, isLoading },
    total,
  } = useVotingRewards(page, limit, sortBy.key, sortBy.direction);

  const loadingArr = new Array(5).fill({}) as VotingReward[];
  const rewards = data ?? loadingArr;

  const onLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(BASE_PAGE);
  };

  return (
    <>
      <Density compact>
        <div className='grid grid-cols-[auto_1fr_1fr_32px]'>
          <div className='grid grid-cols-subgrid col-span-4'>
            {getTableHeader('epoch', 'Epoch')}
            <TableCell heading>Casted Vote</TableCell>
            {getTableHeader('reward', 'Reward')}
            <TableCell heading> </TableCell>
          </div>

          {rewards.map((reward, index) => (
            <div key={index} className='grid grid-cols-subgrid col-span-4'>
              <TableCell cell loading={isLoading}>
                Epoch #{reward.epoch}
              </TableCell>
              <TableCell cell loading={isLoading}>
                {!isLoading && <Vote asset={reward.vote.asset} percent={reward.vote.percent} />}
              </TableCell>
              <TableCell cell loading={isLoading}>
                <ValueViewComponent valueView={reward.reward} priority='tertiary' />
              </TableCell>
              <TableCell cell loading={isLoading}>
                <Density slim>
                  <Button iconOnly icon={ChevronRight}>
                    Go to voting reward information
                  </Button>
                </Density>
              </TableCell>
            </div>
          ))}
        </div>
      </Density>

      {!isLoading && total >= BASE_LIMIT && (
        <Pagination
          totalItems={total}
          visibleItems={rewards.length}
          value={page}
          limit={limit}
          onChange={setPage}
          onLimitChange={onLimitChange}
        />
      )}
    </>
  );
});
