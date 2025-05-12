import { observer } from 'mobx-react-lite';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Density } from '@penumbra-zone/ui/Density';
import { connectionStore } from '@/shared/model/connection';
import { usePersonalRewards, BASE_LIMIT, BASE_PAGE } from '../api/use-personal-rewards';
import { DelegatorHistorySortKey, LqtDelegatorHistoryData } from '../server/delegator-history';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Button } from '@penumbra-zone/ui/Button';
import { ChevronRight } from 'lucide-react';
import { useStakingTokenMetadata } from '@/shared/api/registry';
import { useCurrentEpoch } from '@/pages/tournament/api/use-current-epoch';
import { useTournamentSummary } from '../api/use-tournament-summary';
import { ReactNode, useState } from 'react';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { useSortableTableHeaders } from './sortable-table-header';
import { LqtSummary } from '@/shared/database/schema';
import { useGetMetadata } from '@/shared/api/assets';
import { toValueView } from '@/shared/utils/value-view';

interface LayoutProps {
  getTableHeader: (key: 'epoch' | 'reward', label: string) => ReactNode;
}

const Layout = observer(({ getTableHeader, children }: React.PropsWithChildren<LayoutProps>) => {
  return (
    <Density compact>
      <div className='grid grid-cols-[auto_1fr_1fr_32px]'>
        <div className='grid grid-cols-subgrid col-span-4'>
          {getTableHeader('epoch', 'Epoch')}
          <TableCell heading>Casted Vote</TableCell>
          {getTableHeader('reward', 'Reward')}
          <TableCell heading> </TableCell>
        </div>
        {children}
      </div>
    </Density>
  );
});

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
      <span className='font-mono'>{`${((reward.power / summary.total_voting_power) * 100).toFixed(3)}% for `}</span>
      <ValueViewComponent showValue={false} valueView={valueView} />
    </TableCell>
  );
});

export const VotingRewards = observer(() => {
  const [page, setPage] = useState(BASE_PAGE);
  const [limit, setLimit] = useState(BASE_LIMIT);
  const { getTableHeader, sortBy } = useSortableTableHeaders<DelegatorHistorySortKey>(
    'epoch',
    'desc',
  );

  const { subaccount } = connectionStore;

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
    sortBy.key,
    sortBy.direction,
  );

  const { data: stakingToken } = useStakingTokenMetadata();

  // Extract epochs for summary lookup
  const epochs = [...rewardsData.keys()];

  const { data: rawSummary } = useTournamentSummary(
    {
      epochs: epochs.length > 0 ? epochs : undefined,
    },
    epochs.length === 0,
  );
  if (epoch === undefined || rewardsStatus !== 'success' || rawSummary === undefined) {
    return (
      <Layout getTableHeader={getTableHeader}>
        {new Array(5).map((_, i) => {
          return (
            <div key={`loading-${i}`} className='grid grid-cols-subgrid col-span-4'>
              <TableCell cell loading={true}>
                undefined
              </TableCell>
              <TableCell cell loading={true}>
                undefined
              </TableCell>
              <TableCell cell loading={true}>
                undefined
              </TableCell>
              <TableCell cell loading={true}>
                <Density slim>
                  <Button iconOnly icon={ChevronRight} disabled={true}>
                    Go to voting reward information
                  </Button>
                </Density>
              </TableCell>
            </div>
          );
        })}
      </Layout>
    );
  }
  const summary = new Map(rawSummary.map(x => [x.epoch, x]));

  const onLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(BASE_PAGE);
  };

  return (
    <>
      <Layout getTableHeader={getTableHeader}>
        {Array.from(rewardsData.entries(), ([epoch, reward]) => {
          const matchingSummary = summary.get(epoch);
          if (!matchingSummary) {
            throw new Error(`IMPOSSIBLE: no tournament summary at epoch: ${epoch}`);
          }

          const rewardView = toValueView({ amount: reward.reward, metadata: stakingToken });

          const rowKey = `epoch-${epoch}`;

          return (
            <div key={rowKey} className='grid grid-cols-subgrid col-span-4'>
              <TableCell cell>{`Epoch #${epoch}`}</TableCell>

              <RewardCell reward={reward} summary={matchingSummary} />

              <TableCell cell>
                <ValueViewComponent valueView={rewardView} priority='tertiary' />
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
        })}
      </Layout>

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
