import { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Button } from '@penumbra-zone/ui/Button';
import { Density } from '@penumbra-zone/ui/Density';
import { withdrawPositions } from '@/entities/position/api/withdraw-positions';
import {
  useLpRewards,
  BASE_LIMIT,
  BASE_PAGE,
  LpReward,
} from '@/pages/tournament/api/use-lp-rewards';
import { useSortableTableHeaders } from '@/pages/tournament/ui/sortable-table-header';
import { connectionStore } from '@/shared/model/connection';
import { useRouter } from 'next/navigation';
import { LpRewardsSortKey } from '../server/lp-rewards';
import { ValueView, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { useAssets } from '@/shared/api/assets';
import { pnum } from '@penumbra-zone/types/pnum';

function LpRewardRow({
  lpReward,
  loading,
  umMetadata,
}: {
  lpReward: LpReward;
  loading: boolean;
  umMetadata: Metadata | undefined;
}) {
  const router = useRouter();

  return (
    <div
      onClick={() => {
        router.push(`/inspect/lp/${bech32mPositionId(lpReward.positionId)}`);
      }}
      className='grid grid-cols-subgrid col-span-5 hover:bg-action-hoverOverlay transition-colors cursor-pointer'
    >
      <TableCell cell loading={loading}>
        #{lpReward.epoch}
      </TableCell>
      <TableCell cell loading={loading}>
        {!loading && (
          <>
            <div className='max-w-[370px] truncate'>{bech32mPositionId(lpReward.positionId)}</div>
            <ExternalLink className='size-3 min-w-3 text-neutral-light' />
          </>
        )}
      </TableCell>
      <TableCell cell loading={loading}>
        {umMetadata && (
          <ValueViewComponent
            valueView={
              new ValueView({
                valueView: {
                  case: 'knownAssetId',
                  value: {
                    amount: pnum(lpReward.rewards).toAmount(),
                    metadata: umMetadata as unknown as Metadata,
                  },
                },
              })
            }
            priority='tertiary'
          />
        )}
      </TableCell>
      <TableCell cell loading={loading}>
        {(lpReward.isWithdrawable || lpReward.isWithdrawn) && (
          <Density slim>
            <div>
              <Button
                priority='primary'
                disabled={!lpReward.isWithdrawable}
                onClick={
                  lpReward.isWithdrawable
                    ? e => {
                        e.stopPropagation();
                        void withdrawPositions([
                          { position: lpReward.position, id: lpReward.positionId },
                        ]);
                      }
                    : undefined
                }
              >
                {lpReward.isWithdrawn ? 'Withdrawn' : ''}
                {lpReward.isWithdrawable ? 'Withdraw' : ''}
              </Button>
            </div>
          </Density>
        )}
      </TableCell>
      <TableCell cell loading={loading}>
        <Density slim>
          <Button iconOnly icon={ChevronRight}>
            Go to position information
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
  const { getTableHeader, sortBy } = useSortableTableHeaders<keyof LpReward>('epoch');
  const { data: assets } = useAssets();
  const umMetadata = useMemo(() => {
    return assets.find(asset => asset.symbol === 'UM');
  }, [assets]);

  const query = useLpRewards(
    subaccount,
    page,
    limit,
    sortBy.key as LpRewardsSortKey,
    sortBy.direction,
  );
  const { data: queryData, isLoading, isFetched } = query;
  const { data, total } = queryData ?? { data: [], total: 0 };
  const loadingArr = new Array(5).fill({ positionId: {} }) as LpReward[];
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
            <TableCell heading>Position ID</TableCell>
            {getTableHeader('rewards', 'Reward')}
            <TableCell heading> </TableCell>
            <TableCell heading> </TableCell>
          </div>

          {rewards.map((lpReward, index) => (
            <LpRewardRow
              key={
                loading ? index : String(lpReward.epoch) + bech32mPositionId(lpReward.positionId)
              }
              lpReward={lpReward}
              umMetadata={umMetadata}
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
