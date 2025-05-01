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
import { connectionStore } from '@/shared/model/connection';

export const LpRewards = observer(() => {
  const { subaccount } = connectionStore;
  const [page, setPage] = useState(BASE_PAGE);
  const [limit, setLimit] = useState(BASE_LIMIT);
  const { getTableHeader, sortBy } =
    useSortableTableHeaders<keyof Required<Reward>['sort']>('epoch');

  const query = useLpRewards(subaccount, page, limit, sortBy.key, sortBy.direction);
  const { data: queryData, isLoading, isFetched } = query;
  const { data, total } = queryData ?? { data: [], total: 0 };
  const loadingArr = new Array(5).fill({ positionId: {} }) as Reward[];
  const rewards = data.length > 0 ? data : loadingArr;
  const loading = isLoading || !isFetched;

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

          {rewards.map((lpReward, index) => (
            <Link
              href={`/inspect/lp/${loading ? index : bech32mPositionId(lpReward.positionId)}`}
              key={loading ? index : bech32mPositionId(lpReward.positionId)}
              className='grid grid-cols-subgrid col-span-5 hover:bg-action-hoverOverlay transition-colors cursor-pointer'
            >
              <TableCell cell loading={loading}>
                Epoch #{lpReward.epoch}
              </TableCell>
              <TableCell cell loading={loading}>
                {!loading && (
                  <>
                    <div className='max-w-full truncate'>
                      {bech32mPositionId(lpReward.positionId)}
                    </div>
                    <ExternalLink className='size-3 min-w-3 text-neutral-light' />
                  </>
                )}
              </TableCell>
              <TableCell cell loading={loading}>
                <ValueViewComponent valueView={lpReward.lpReward} priority='tertiary' />
              </TableCell>
              <TableCell cell loading={loading}>
                <Density slim>
                  <Button priority='primary' disabled={lpReward.isWithdrawn}>
                    {lpReward.isWithdrawn ? 'Withdrawn' : 'Withdraw'}
                  </Button>
                </Density>
              </TableCell>
              <TableCell cell loading={loading}>
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
