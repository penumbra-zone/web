import { observer } from 'mobx-react-lite';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Density } from '@penumbra-zone/ui/Density';
import { connectionStore } from '@/shared/model/connection';
import { usePersonalRewards, BASE_LIMIT, BASE_PAGE } from '../api/use-personal-rewards';
import { DelegatorHistorySortKey, LqtDelegatorHistoryData } from '../server/delegator-history';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Button } from '@penumbra-zone/ui/Button';
import { ChevronRight } from 'lucide-react';
import { useStakingTokenMetadata } from '@/shared/api/registry';
import { useCurrentEpoch } from '@/pages/tournament/api/use-current-epoch';
import { pnum } from '@penumbra-zone/types/pnum';
import { useTournamentSummary } from '../api/use-tournament-summary';
import { useState, useMemo } from 'react';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { useSortableTableHeaders } from './sortable-table-header';

export const VotingRewards = observer(() => {
  const [page, setPage] = useState(BASE_PAGE);
  const [limit, setLimit] = useState(BASE_LIMIT);
  const { getTableHeader, sortBy } = useSortableTableHeaders<DelegatorHistorySortKey>(
    'epoch',
    'desc',
  );

  const { subaccount } = connectionStore;

  const { epoch, isLoading: epochLoading } = useCurrentEpoch();
  const {
    query: { isLoading: rewardsLoading },
    data: rewardsData,
    total,
  } = usePersonalRewards(
    subaccount,
    epoch,
    epochLoading,
    page,
    limit,
    sortBy.key,
    sortBy.direction,
  );

  const { data: stakingToken, isLoading: stakingLoading } = useStakingTokenMetadata();

  // Extract epochs for summary lookup
  const epochs = useMemo(() => rewardsData?.map(r => r.epoch).filter(Boolean) ?? [], [rewardsData]);

  const { data: summary, isLoading: summaryLoading } = useTournamentSummary(
    {
      epochs: epochs.length > 0 ? epochs : undefined,
    },
    epochLoading || rewardsLoading || !epochs.length,
  );

  const isLoading = rewardsLoading || stakingLoading || summaryLoading || epochLoading;

  const onLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(BASE_PAGE);
  };

  const loadingArr = new Array(5).fill({
    address: {},
    asset_id: {},
    metadata: {},
    epoch: {},
    power: {},
    reward: {},
  }) as LqtDelegatorHistoryData[];

  const displayData = isLoading ? loadingArr : (rewardsData ?? []);

  // TODO: populate casted votes with metadata when registry is fixed.
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

          {!isLoading && (!rewardsData || rewardsData.length === 0) && (
            <div className='col-span-4 text-sm text-muted-foreground py-4'>
              No voting rewards found for this account.
            </div>
          )}

          {displayData.map((rewardData, index) => {
            const matchingSummary = !isLoading
              ? summary?.find(s => s.epoch === rewardData.epoch)
              : undefined;

            const hasVoteWeightData = Boolean(
              matchingSummary?.total_voting_power && rewardData.power > 0,
            );

            const rewardView = !isLoading
              ? new ValueView({
                  valueView: {
                    case: 'knownAssetId',
                    value: {
                      amount: pnum(rewardData.reward).toAmount(),
                      metadata: stakingToken,
                    },
                  },
                })
              : undefined;

            const rowKey = isLoading ? `loading-${index}` : `epoch-${rewardData.epoch}`;

            return (
              <div key={rowKey} className='grid grid-cols-subgrid col-span-4'>
                <TableCell cell loading={isLoading}>
                  {!isLoading && `Epoch #${rewardData.epoch.toString()}`}
                </TableCell>

                <TableCell cell loading={isLoading || !hasVoteWeightData}>
                  {!isLoading &&
                    matchingSummary &&
                    ((rewardData.power / matchingSummary.total_voting_power) * 100).toFixed(3) +
                      '%'}
                </TableCell>

                <TableCell cell loading={isLoading || !rewardView}>
                  {rewardView && <ValueViewComponent valueView={rewardView} priority='tertiary' />}
                </TableCell>

                <TableCell cell loading={isLoading}>
                  <Density slim>
                    <Button
                      iconOnly
                      icon={ChevronRight}
                      disabled={isLoading}
                      onClick={() => (window.location.href = `/tournament/${rewardData.epoch}`)}
                    >
                      Go to voting reward information
                    </Button>
                  </Density>
                </TableCell>
              </div>
            );
          })}
        </div>
      </Density>

      {!isLoading && total >= BASE_LIMIT && (
        <Pagination
          totalItems={total}
          visibleItems={displayData.length}
          value={page}
          limit={limit}
          onChange={setPage}
          onLimitChange={onLimitChange}
        />
      )}
    </>
  );
});
