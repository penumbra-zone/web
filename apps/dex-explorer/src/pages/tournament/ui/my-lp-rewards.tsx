import Link from 'next/link';
import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Button } from '@penumbra-zone/ui/Button';
import { Density } from '@penumbra-zone/ui/Density';
import { useLpRewards, BASE_LIMIT, BASE_PAGE, Reward } from '../api/use-lp-rewards';
import { useSortableTableHeaders } from './sortable-table-header';

export const MyLpRewards = observer(() => {
  const [page, setPage] = useState(BASE_PAGE);
  const [limit, setLimit] = useState(BASE_LIMIT);
  const { getTableHeader, sortBy } = useSortableTableHeaders<keyof Required<Reward>['sort']>();

  const {
    query: { data, isLoading },
    total,
  } = useLpRewards(page, limit, sortBy.key, sortBy.direction);

  const loadingArr = new Array(5).fill({ positionId: {} }) as Reward[];
  const rewards = data ?? loadingArr;

  const onLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(BASE_PAGE);
  };

  return (
    <>
      <Density compact>
        <div className='grid grid-cols-[auto_1fr_1fr_100px_48px]'>
          <div className='grid grid-cols-subgrid col-span-5'>
            {getTableHeader('epoch', 'Epoch')}
            {getTableHeader('positionId', 'Position ID')}
            {getTableHeader('reward', 'Reward')}
            <TableCell heading> </TableCell>
            <TableCell heading> </TableCell>
          </div>

          {rewards.map((reward, index) => (
            <Link
              href={`/inspect/lp/${isLoading ? index : bech32mPositionId(reward.positionId)}`}
              key={isLoading ? index : bech32mPositionId(reward.positionId)}
              className='grid grid-cols-subgrid col-span-5 hover:bg-action-hoverOverlay transition-colors cursor-pointer'
            >
              <TableCell cell loading={isLoading}>
                Epoch #{reward.epoch}
              </TableCell>
              <TableCell cell loading={isLoading}>
                {!isLoading && (
                  <>
                    <div className='max-w-full truncate'>
                      {bech32mPositionId(reward.positionId)}
                    </div>
                    <ExternalLink className='size-3 min-w-3 text-neutral-light' />
                  </>
                )}
              </TableCell>
              <TableCell cell loading={isLoading}>
                <ValueViewComponent valueView={reward.reward} priority='tertiary' />
              </TableCell>
              <TableCell cell loading={isLoading}>
                <Density slim>
                  <Button priority='primary' disabled={reward.isWithdrawn}>
                    {reward.isWithdrawn ? 'Withdrawn' : 'Withdraw'}
                  </Button>
                </Density>
              </TableCell>
              <TableCell cell loading={isLoading}>
                <Density slim>
                  <Button iconOnly icon={ChevronRight}>
                    Go to position information page
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
