import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Density } from '@penumbra-zone/ui/Density';
import { Button } from '@penumbra-zone/ui/Button';
import { pnum } from '@penumbra-zone/types/pnum';
import { ValueView, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  useLpRewards,
  BASE_LIMIT,
  BASE_PAGE,
  LpReward,
} from '@/pages/tournament/api/use-lp-rewards';
import { withdrawPositions } from '@/entities/position/api/withdraw-positions';
import { connectionStore } from '@/shared/model/connection';
import { LoadingRow } from '@/shared/ui/loading-row';
import { useStakingTokenMetadata } from '@/shared/api/registry';
import { LpRewardsSortKey } from '../server/lp-rewards';
import { useSortableTableHeaders } from './sortable-table-header';

function LpRewardRow({ lpReward, umMetadata }: { lpReward: LpReward; umMetadata: Metadata }) {
  const router = useRouter();
  const id = bech32mPositionId(lpReward.positionId);

  return (
    <div
      onClick={() => {
        router.push(`/inspect/lp/${id}`);
      }}
      className='grid grid-cols-subgrid col-span-5 hover:bg-action-hoverOverlay transition-colors cursor-pointer'
    >
      <TableCell cell>#{lpReward.epoch}</TableCell>
      <TableCell cell>
        <div className='max-w-[370px] truncate'>{id}</div>
        <ExternalLink className='size-3 min-w-3 text-neutral-light' />
      </TableCell>
      <TableCell cell>
        <ValueViewComponent
          valueView={
            new ValueView({
              valueView: {
                case: 'knownAssetId',
                value: {
                  amount: pnum(lpReward.rewards).toAmount(),
                  metadata: umMetadata,
                },
              },
            })
          }
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
    </div>
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
  const rewards = data?.data;
  const total = data?.total ?? 0;

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

          {!loading && !total && (
            <div className='col-span-5 text-sm text-muted-foreground py-4'>
              No LP rewards found for this account.
            </div>
          )}

          {loading &&
            new Array(BASE_LIMIT).fill({}).map((_, index) => <LoadingRow cells={5} key={index} />)}

          {rewards?.map((lpReward, index) => (
            <LpRewardRow key={index} lpReward={lpReward} umMetadata={umMetadata} />
          ))}
        </div>
      </Density>

      {!loading && total >= BASE_LIMIT && (
        <Pagination
          totalItems={total}
          visibleItems={rewards?.length}
          value={page}
          limit={limit}
          onChange={setPage}
          onLimitChange={onLimitChange}
        />
      )}
    </>
  );
});
