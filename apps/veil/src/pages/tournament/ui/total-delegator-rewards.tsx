import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronRight } from 'lucide-react';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Density } from '@penumbra-zone/ui/Density';
import { Button } from '@penumbra-zone/ui/Button';
import { connectionStore } from '@/shared/model/connection';
import { useStakingTokenMetadata } from '@/shared/api/registry';
import { getValueViewLength } from '@/shared/utils/get-max-padstart';
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

interface VotingRewardData extends LqtDelegatorHistoryData {
  rewardView?: ValueView;
  summary: LqtSummary;
}

interface VotingRewardsRowProps {
  row: VotingRewardData;
  padStart?: number;
}

const VotingRewardsRow = ({ row, padStart }: VotingRewardsRowProps) => {
  return (
    <div className='grid grid-cols-subgrid col-span-4'>
      <TableCell cell>{`Epoch #${row.epoch}`}</TableCell>
      <RewardCell reward={row} />
      <TableCell cell>
        <ValueViewComponent
          padStart={padStart}
          valueView={row.rewardView}
          priority='tertiary'
          trailingZeros
        />
      </TableCell>
      <TableCell cell>
        <Density slim>
          <Button
            iconOnly
            icon={ChevronRight}
            onClick={() => (window.location.href = `/tournament/${row.epoch}`)}
          >
            Go to voting reward information
          </Button>
        </Density>
      </TableCell>
    </div>
  );
};

const RewardCell = observer(({ reward }: { reward: VotingRewardData }) => {
  const getMetadata = useGetMetadata();
  const assetId = reward.asset_id;
  const amount = reward.reward;
  const metadata = getMetadata(assetId);
  const valueView = toValueView(metadata ? { metadata, amount } : { assetId, amount });
  return (
    <TableCell cell>
      <span className='font-mono whitespace-pre'>
        {`${((reward.power / reward.summary.total_voting_power) * 100).toFixed(3).padStart(6, '\u00A0')}% for `}
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
  const summary = useMemo(() => new Map((rawSummary ?? []).map(x => [x.epoch, x])), [rawSummary]);

  const mappedData = useMemo(() => {
    return Array.from(rewardsData.entries()).reduce<{ rows: VotingRewardData[]; padStart: number }>(
      (accum, [epoch, row]) => {
        const matchingSummary = summary.get(epoch);
        if (!matchingSummary) {
          return accum;
        }

        const rewardView = toValueView({ amount: row.reward, metadata: stakingToken });
        accum.padStart = Math.max(accum.padStart, getValueViewLength(rewardView));
        accum.rows.push({
          ...row,
          rewardView,
          summary: matchingSummary,
        });

        return accum;
      },
      { rows: [], padStart: 0 },
    );
  }, [rewardsData, stakingToken, summary]);

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
            mappedData.rows.map(row => (
              <VotingRewardsRow
                key={`epoch-${row.epoch}`}
                padStart={mappedData.padStart}
                row={row}
              />
            ))}
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
