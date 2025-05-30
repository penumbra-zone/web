import Link from 'next/link';
import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronRight } from 'lucide-react';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Density } from '@penumbra-zone/ui/Density';
import { Button } from '@penumbra-zone/ui/Button';
import { round } from '@penumbra-zone/types/round';
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
  castedVoteView: ValueView;
  summary: LqtSummary;
}

interface VotingRewardsRowProps {
  row: VotingRewardData;
  padStart?: number;
}

const VotingRewardsRow = ({ row, padStart }: VotingRewardsRowProps) => {
  return (
    <Link
      className='grid grid-cols-subgrid col-span-4 hover:bg-action-hoverOverlay'
      href={`/tournament/${row.epoch}`}
    >
      <TableCell cell>{`Epoch #${row.epoch}`}</TableCell>
      <TableCell cell>
        <span className='font-mono whitespace-pre'>
          {round({
            value: (row.power / row.summary.total_voting_power) * 100,
            decimals: 3,
          }).padStart(6, '\u00A0')}
          % for
        </span>
        <ValueViewComponent showValue={false} valueView={row.castedVoteView} />
      </TableCell>
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
    </Link>
  );
};

export const VotingRewards = observer(() => {
  const { subaccount } = connectionStore;
  const [page, setPage] = useState(BASE_PAGE);
  const [limit, setLimit] = useState(BASE_LIMIT);
  const getMetadata = useGetMetadata();
  const { data: stakingToken } = useStakingTokenMetadata();

  const { getTableHeader, sortBy } = useSortableTableHeaders<DelegatorHistorySortKey>(
    'epoch',
    'desc',
  );

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

        const voteMetadata = getMetadata(row.asset_id);
        const voteView = toValueView(
          voteMetadata
            ? { metadata: voteMetadata, amount: row.reward }
            : { assetId: row.asset_id, amount: row.reward },
        );

        accum.padStart = Math.max(accum.padStart, getValueViewLength(rewardView));
        accum.rows.push({
          ...row,
          rewardView,
          castedVoteView: voteView,
          summary: matchingSummary,
        });

        return accum;
      },
      { rows: [], padStart: 0 },
    );
  }, [rewardsData, stakingToken, summary, getMetadata]);

  const onLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(BASE_PAGE);
  };

  return (
    <>
      <Density compact>
        <div className='grid grid-cols-[auto_1fr_1fr_48px] max-w-full overflow-x-auto'>
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
