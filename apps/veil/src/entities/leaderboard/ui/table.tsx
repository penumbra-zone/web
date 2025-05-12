'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useState, useMemo, useRef, useCallback } from 'react';
import cn from 'clsx';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';
import { Card } from '@penumbra-zone/ui/Card';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { SegmentedControl } from '@penumbra-zone/ui/SegmentedControl';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { AssetSelector, AssetSelectorValue } from '@penumbra-zone/ui/AssetSelector';
import { useAssets } from '@/shared/api/assets';
import { useBalances } from '@/shared/api/balances';
import { stateToString } from '@/entities/position/model/state-to-string';
import { useSortableTableHeaders } from '@/pages/tournament/ui/sortable-table-header';
import { useCurrentEpoch } from '@/pages/tournament/api/use-current-epoch';
import { useLpLeaderboard } from '@/entities/leaderboard/api/use-lp-leaderboard';
import { LpLeaderboardSortKey } from '@/entities/leaderboard/api/utils';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { pnum } from '@penumbra-zone/types/pnum';
import { observer } from 'mobx-react-lite';
import { connectionStore } from '@/shared/model/connection';
import { useMyLpLeaderboard } from '@/entities/leaderboard/api/use-my-lp-leaderboard';
import { round } from '@penumbra-zone/types/round';

const Tabs = {
  AllLPs: 'All LPs',
  MyLPs: 'My LPs',
} as const;

type Tab = (typeof Tabs)[keyof typeof Tabs];

export const LeaderboardTable = observer(() => {
  const { connected, subaccount } = connectionStore;
  const totalRef = useRef<number>(0);
  const searchParams = useSearchParams();
  const page = Number(searchParams?.get('page') ?? 1);
  const [currentPage, setCurrentPage] = useState(page);
  const [parent] = useAutoAnimate();
  const [quote, setQuote] = useState<AssetSelectorValue>();
  const [tab, setTab] = useState<Tab>(Tabs.AllLPs);
  const [limit, setLimit] = useState(10);
  const { getTableHeader, sortBy } = useSortableTableHeaders<LpLeaderboardSortKey>('points');

  const { data: assets } = useAssets();
  const { data: balances } = useBalances();
  const { epoch, isLoading: epochLoading } = useCurrentEpoch();

  const umMetadata = useMemo(() => {
    return assets.find(asset => asset.symbol === 'UM');
  }, [assets]);
  const getAssetMetadata = useCallback(
    (assetId: AssetId) => {
      return assets.find(asset => asset.penumbraAssetId?.equals(assetId));
    },
    [assets],
  );

  const {
    data: leaderboard,
    error: leaderboardError,
    isLoading: leaderboardLoading,
  } = useLpLeaderboard({
    epoch,
    page: currentPage,
    limit,
    sortKey: sortBy.key,
    sortDirection: sortBy.direction,
  });

  const {
    data: myLeaderboard,
    error: myLeaderboardError,
    isLoading: myLeaderboardLoading,
  } = useMyLpLeaderboard({
    subaccount,
    epoch,
    page: currentPage,
    limit,
    sortKey: sortBy.key,
    sortDirection: sortBy.direction,
  });

  const isMyTab = tab === Tabs.MyLPs;
  const positions = isMyTab ? myLeaderboard?.data : leaderboard?.data;
  const total = isMyTab ? myLeaderboard?.total : leaderboard?.total;
  const error = isMyTab ? myLeaderboardError : leaderboardError;
  const isLoading = epochLoading || isMyTab ? myLeaderboardLoading : leaderboardLoading;
  totalRef.current = total ?? totalRef.current;

  if (error) {
    return (
      <Text large color='destructive.light'>
        {error.message}
      </Text>
    );
  }

  return (
    <Card>
      <div className='px-2'>
        <div className='flex justify-between items-center mb-4'>
          <Text xxl color='text.primary'>
            LPs Leaderboard
          </Text>

          <AssetSelector assets={assets} balances={balances} value={quote} onChange={setQuote} />
        </div>

        {connected && (
          <div className='[&>*>*]:w-1/2 mb-4'>
            <SegmentedControl value={tab} onChange={opt => setTab(opt as 'All LPs' | 'My LPs')}>
              <SegmentedControl.Item
                value='All LPs'
                style={tab === 'All LPs' ? 'filled' : 'unfilled'}
              >
                All LPs
              </SegmentedControl.Item>
              <SegmentedControl.Item
                value='My LPs'
                style={tab === 'My LPs' ? 'filled' : 'unfilled'}
              >
                My LPs
              </SegmentedControl.Item>
            </SegmentedControl>
          </div>
        )}

        <div ref={parent} className='grid grid-cols-6 h-auto overflow-auto'>
          <div className='grid grid-cols-subgrid col-span-6'>
            <TableCell heading>Position ID</TableCell>
            {getTableHeader('executions', 'Execs')}
            {getTableHeader('points', 'Points')}
            {/* @TODO add age & pnlPercentage */}
            {/* {getTableHeader('pnlPercentage', 'PnL')} */}
            {/* {getTableHeader('age', 'Age')} */}
            <TableCell heading>Volume</TableCell>
            <TableCell heading>Fees</TableCell>
            <TableCell heading>State</TableCell>
          </div>

          {isLoading ? (
            Array.from({ length: limit }).map((_, index) => (
              <div className='grid grid-cols-subgrid col-span-6' key={index}>
                <TableCell loading>&nbsp;</TableCell>
                <TableCell loading>&nbsp;</TableCell>
                <TableCell loading>&nbsp;</TableCell>
                {/* @TODO add age & pnlPercentage */}
                {/* <TableCell loading>&nbsp;</TableCell> */}
                {/* <TableCell loading>&nbsp;</TableCell> */}
                <TableCell loading>&nbsp;</TableCell>
                <TableCell loading>&nbsp;</TableCell>
                <TableCell loading>&nbsp;</TableCell>
              </div>
            ))
          ) : (
            <>
              {positions?.length ? (
                positions.map(position => {
                  return (
                    <Link
                      key={position.positionIdString}
                      href={`/inspect/lp/${position.positionIdString}`}
                      className={cn(
                        'relative grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] col-span-6',
                        'bg-transparent hover:bg-action-hoverOverlay transition-colors',
                        '[&>*]:h-auto',
                      )}
                    >
                      <TableCell cell>
                        <div className='flex max-w-[104px]'>
                          <Text smallTechnical color='text.primary' truncate>
                            {position.positionIdString}
                          </Text>
                          <span>
                            <SquareArrowOutUpRight className='w-4 h-4 text-text-secondary' />
                          </span>
                        </div>
                      </TableCell>
                      <TableCell cell>
                        <Text smallTechnical>{position.executions}</Text>
                      </TableCell>
                      <TableCell cell loading={isLoading}>
                        <Text smallTechnical>
                          {round({ value: position.pointsShare * 100, decimals: 2 })}%
                        </Text>
                      </TableCell>
                      {/* @TODO add age & pnlPercentage */}
                      {/* <TableCell cell numeric loading={isLoading}>
                        <Text
                          smallTechnical
                          color={
                            position.pnlPercentage >= 0 ? 'success.light' : 'destructive.light'
                          }
                        >
                          {position.pnlPercentage}%
                        </Text>
                      </TableCell> */}
                      {/* <TableCell cell numeric>
                        {formatAge(position.openingTime)}
                      </TableCell> */}
                      <TableCell cell>
                        <ValueViewComponent
                          valueView={pnum(position.umVolume).toValueView(umMetadata)}
                          abbreviate={true}
                          density='slim'
                        />
                      </TableCell>
                      <TableCell cell>
                        <ValueViewComponent
                          valueView={pnum(position.assetFees).toValueView(
                            getAssetMetadata(position.assetId),
                          )}
                          abbreviate={true}
                          density='slim'
                        />
                      </TableCell>
                      <TableCell cell>
                        <Text smallTechnical>{stateToString(position.position.state?.state)}</Text>
                      </TableCell>
                    </Link>
                  );
                })
              ) : (
                <div className='col-span-6'>
                  <TableCell>
                    {tab === Tabs.AllLPs
                      ? 'There are no liquidity positions in this epoch.'
                      : 'You have no liquidity positions in this epoch.'}
                  </TableCell>
                </div>
              )}
            </>
          )}
        </div>

        <div className='pt-4'>
          <Pagination
            value={currentPage}
            totalItems={totalRef.current}
            limit={limit}
            onLimitChange={setLimit}
            onChange={setCurrentPage}
          />
        </div>
      </div>
    </Card>
  );
});
