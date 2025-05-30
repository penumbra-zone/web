import Link from 'next/link';
import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Density } from '@penumbra-zone/ui/Density';
import { Button } from '@penumbra-zone/ui/Button';
import { pnum } from '@penumbra-zone/types/pnum';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  useLpRewards,
  BASE_LIMIT,
  BASE_PAGE,
  LpReward,
} from '@/pages/tournament/api/use-lp-rewards';
import { toValueView } from '@/shared/utils/value-view';
import { getValueViewLength } from '@/shared/utils/get-max-padstart';
import { withdrawPositions } from '@/entities/position/api/withdraw-positions';
import { connectionStore } from '@/shared/model/connection';
import { LoadingRow } from '@/shared/ui/loading-row';
import { useStakingTokenMetadata } from '@/shared/api/registry';
import { LpRewardsSortKey } from '../server/lp-rewards';
import { useSortableTableHeaders } from './sortable-table-header';

interface LpRewardRowData extends LpReward {
  rewardView?: ValueView;
}

function LpRewardRow({ lpReward, padStart }: { lpReward: LpRewardRowData; padStart?: number }) {
  const id = bech32mPositionId(lpReward.positionId);

  return (
    <Link
      className='grid grid-cols-subgrid col-span-5 hover:bg-action-hoverOverlay transition-colors cursor-pointer'
      href={`/inspect/lp/${id}`}
    >
      <TableCell cell>#{lpReward.epoch}</TableCell>
      <TableCell cell>
        <div className='max-w-[370px] truncate'>{id}</div>
        <ExternalLink className='size-3 min-w-3 text-neutral-light' />
      </TableCell>
      <TableCell cell>
        <ValueViewComponent
          trailingZeros
          padStart={padStart}
          valueView={lpReward.rewardView}
          priority='tertiary'
        />
      </TableCell>
      <TableCell cell>
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
      <TableCell cell>
        <Density slim>
          <Button iconOnly icon={ChevronRight}>
            Go to position information
          </Button>
        </Density>
      </TableCell>
    </Link>
  );
}

export const LpRewards = observer(() => {
  const { subaccount } = connectionStore;
  const [page, setPage] = useState(BASE_PAGE);
  const [limit, setLimit] = useState(BASE_LIMIT);
  const { getTableHeader, sortBy } = useSortableTableHeaders<keyof LpReward>('epoch');
  const { data: umMetadata } = useStakingTokenMetadata();

  const { data, isPending } = useLpRewards(
    subaccount,
    page,
    limit,
    sortBy.key as LpRewardsSortKey,
    sortBy.direction,
  );

  const loading = isPending;
  const total = data?.total ?? 0;

  const mappedData = useMemo(() => {
    return data?.data.reduce<{ rows: LpRewardRowData[]; padStart: number }>(
      (accum, row) => {
        const rewardView = toValueView({
          amount: pnum(row.rewards).toAmount(),
          metadata: umMetadata,
        });
        accum.padStart = Math.max(accum.padStart, getValueViewLength(rewardView));
        accum.rows.push({
          ...row,
          rewardView,
        });

        return accum;
      },
      { rows: [], padStart: 0 },
    );
  }, [data, umMetadata]);

  const onLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(BASE_PAGE);
  };

  return (
    <>
      <Density compact>
        <div className='grid grid-cols-[auto_1fr_1fr_100px_48px] max-w-full overflow-x-auto'>
          <div className='grid grid-cols-subgrid col-span-5'>
            {getTableHeader('epoch', 'Epoch')}
            <TableCell heading>Position ID</TableCell>
            {getTableHeader('rewards', 'Reward')}
            <TableCell heading> </TableCell>
            <TableCell heading> </TableCell>
          </div>

          {!loading && !total && (
            <div className='grid grid-cols-subgrid col-span-4'>
              <TableCell cell>No LP rewards found for this account.</TableCell>
            </div>
          )}

          {loading &&
            new Array(BASE_LIMIT).fill({}).map((_, index) => <LoadingRow cells={5} key={index} />)}

          {mappedData?.rows.map((lpReward, index) => (
            <LpRewardRow key={index} lpReward={lpReward} padStart={mappedData.padStart} />
          ))}
        </div>
      </Density>

      {!loading && total >= BASE_LIMIT && (
        <Pagination
          totalItems={total}
          visibleItems={mappedData?.rows.length}
          value={page}
          limit={limit}
          onChange={setPage}
          onLimitChange={onLimitChange}
        />
      )}
    </>
  );
});
