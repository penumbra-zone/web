import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronRight } from 'lucide-react';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Density } from '@penumbra-zone/ui/Density';
import { Button } from '@penumbra-zone/ui/Button';
import { connectionStore } from '@/shared/model/connection';
import { useStakingTokenMetadata } from '@/shared/api/registry';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { LqtSummary } from '@/shared/database/schema';
import { LoadingRow } from '@/shared/ui/loading-row';
import { useGetMetadata } from '@/shared/api/assets';
import { toValueView } from '@/shared/utils/value-view';
import { useCurrentEpoch } from '../api/use-current-epoch';
import { usePersonalRewards, BASE_LIMIT, BASE_PAGE } from '../api/use-personal-rewards';
import { DelegatorHistorySortKey, LqtDelegatorHistoryData } from '../server/delegator-history';
import { useTournamentSummary } from '../api/use-tournament-summary';
import { useSortableTableHeaders } from './sortable-table-header';

interface VotingRewardsRowProps {
  epoch: number;
  reward: LqtDelegatorHistoryData;
  stakingToken: Metadata;
  summary: LqtSummary;
  loading?: boolean;
}

const VotingRewardsRow = ({ epoch, reward, stakingToken, summary }: VotingRewardsRowProps) => {
  return (
    <div className='grid grid-cols-subgrid col-span-4'>
      <TableCell cell>{`Epoch #${epoch}`}</TableCell>
      <RewardCell reward={reward} summary={summary} />
      <TableCell cell>
        <ValueViewComponent
          valueView={toValueView({ amount: reward.reward, metadata: stakingToken })}
          priority='tertiary'
          trailingZeros
        />
      </TableCell>
      <TableCell cell>
        <Density slim>
          <Button
            iconOnly
            icon={ChevronRight}
            onClick={() => (window.location.href = `/tournament/${epoch}`)}
          >
            Go to voting reward information
          </Button>
        </Density>
      </TableCell>
    </div>
  );
};

interface RewardCellProps {
  reward: LqtDelegatorHistoryData;
  summary: LqtSummary;
}

const RewardCell = observer(({ reward, summary }: RewardCellProps) => {
  const getMetadata = useGetMetadata();
  const assetId = reward.asset_id;
  const amount = reward.reward;
  const metadata = getMetadata(assetId);
  const valueView = toValueView(metadata ? { metadata, amount } : { assetId, amount });
  return (
    <TableCell cell>
      <span className='font-mono whitespace-pre'>
        {`${((reward.power / summary.total_voting_power) * 100).toFixed(3).padStart(6, '\u00A0')}% for `}
      </span>
      <ValueViewComponent showValue={false} valueView={valueView} />
    </TableCell>
  );
});

export const VotingRewards = observer(() => {
  const { subaccount } = connectionStore;
  const [page, setPage] = useState(BASE_PAGE);
  const [limit, setLimit] = useState(BASE_LIMIT);

  const { getTableHeader, sortBy } = useSortableTableHeaders<DelegatorHistorySortKey>(
    'epoch',
    'desc',
  );

  const { data: stakingToken } = useStakingTokenMetadata();
  const { epoch, status: epochStatus } = useCurrentEpoch();
  const {
    query: { status: rewardsStatus },
    data: rewardsData,
    total,
  } = usePersonalRewards(
    subaccount,
    epoch,
    epochStatus !== 'success',
    page,
    limit,
    sortBy.key as DelegatorHistorySortKey,
    sortBy.direction,
  );

  // Extract epochs for summary lookup
  const epochs = [...rewardsData.keys()];
  const { data: rawSummary } = useTournamentSummary(
    {
      epochs,
      limit,
      page: 1,
    },
    epochs.length === 0,
  );

  const loading = epoch === undefined || rewardsStatus !== 'success' || rawSummary === undefined;
  const summary = new Map((rawSummary ?? []).map(x => [x.epoch, x]));

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

          {loading &&
            new Array(BASE_LIMIT).fill({}).map((_, index) => <LoadingRow cells={4} key={index} />)}

          {!loading && !total && (
            <div className='grid grid-cols-subgrid col-span-4'>
              <TableCell cell>No voting rewards found for this account.</TableCell>
            </div>
          )}

          {!loading &&
            Array.from(rewardsData.entries(), ([epoch, reward]) => {
              const matchingSummary = summary.get(epoch);
              if (!matchingSummary) {
                return null;
              }

              return (
                <VotingRewardsRow
                  key={`epoch-${epoch}`}
                  epoch={epoch}
                  reward={reward}
                  summary={matchingSummary}
                  stakingToken={stakingToken}
                />
              );
            })}
        </div>
      </Density>

      <Pagination
        totalItems={total}
        visibleItems={rewardsData.size}
        value={page}
        limit={limit}
        onChange={setPage}
        onLimitChange={onLimitChange}
      />
    </>
  );
});
