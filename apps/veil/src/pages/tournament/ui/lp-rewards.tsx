import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Button } from '@penumbra-zone/ui/Button';
import { Density } from '@penumbra-zone/ui/Density';
import { withdrawPositions } from '@/entities/position/api/withdraw-positions';
import { useLpRewards, BASE_LIMIT, BASE_PAGE, Reward } from '@/pages/tournament/api/use-lp-rewards';
import { useSortableTableHeaders } from '@/pages/tournament/ui/sortable-table-header';
import { connectionStore } from '@/shared/model/connection';
import { useRouter } from 'next/navigation';

function LpRewardRow({ lpReward, loading }: { lpReward: Reward; loading: boolean }) {
  const router = useRouter();
  const [isHoveringWithdraw, setIsHoveringWithdraw] = useState(false);

  return (
    <div
      onClick={() => {
        if (!isHoveringWithdraw) {
          router.push(`/inspect/lp/${bech32mPositionId(lpReward.positionId)}`);
        }
      }}
      className='grid grid-cols-subgrid col-span-5 hover:bg-action-hoverOverlay transition-colors cursor-pointer'
    >
      <TableCell cell loading={loading}>
        Epoch #{lpReward.epoch}
      </TableCell>
      <TableCell cell loading={loading}>
        {!loading && (
          <>
            <div className='max-w-full truncate'>{bech32mPositionId(lpReward.positionId)}</div>
            <ExternalLink className='size-3 min-w-3 text-neutral-light' />
          </>
        )}
      </TableCell>
      <TableCell cell loading={loading}>
        <ValueViewComponent valueView={lpReward.reward} priority='tertiary' />
      </TableCell>
      <TableCell cell loading={loading}>
        {(lpReward.isWithdrawable || lpReward.isWithdrawn) && (
          <Density slim>
            <Button
              priority='primary'
              disabled={!lpReward.isWithdrawable}
              onMouseEnter={lpReward.isWithdrawable ? () => setIsHoveringWithdraw(true) : undefined}
              onMouseLeave={
                lpReward.isWithdrawable ? () => setIsHoveringWithdraw(false) : undefined
              }
              onClick={
                lpReward.isWithdrawable
                  ? async () => {
                      await withdrawPositions([
                        { position: lpReward.position, id: lpReward.positionId },
                      ]);
                    }
                  : undefined
              }
            >
              {lpReward.isWithdrawn ? 'Withdrawn' : ''}
              {lpReward.isWithdrawable ? 'Withdraw' : ''}
            </Button>
          </Density>
        )}
      </TableCell>
      <TableCell cell loading={loading}>
        <Density slim>
          <Button iconOnly icon={ChevronRight}>
            Go to position information page
          </Button>
        </Density>
      </TableCell>
    </div>
  );
}

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
            <LpRewardRow
              key={loading ? index : lpReward.epoch + bech32mPositionId(lpReward.positionId)}
              lpReward={lpReward}
              loading={loading}
            />
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
