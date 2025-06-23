'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useState, useRef, useMemo } from 'react';
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
import { stateToString } from '@/entities/position/model/state-to-string';
import { useSortableTableHeaders } from '@/pages/tournament/ui/sortable-table-header';
import { useLpLeaderboard } from '@/entities/leaderboard/api/use-lp-leaderboard';
import { LpLeaderboardSortKey } from '@/entities/leaderboard/api/utils';
import { pnum } from '@penumbra-zone/types/pnum';
import { observer } from 'mobx-react-lite';
import { connectionStore } from '@/shared/model/connection';
import { useMyLpLeaderboard } from '@/entities/leaderboard/api/use-my-lp-leaderboard';
import { round } from '@penumbra-zone/types/round';
import { useStakingTokenMetadata } from '@/shared/api/registry';
import { useGetMetadata } from '@/shared/api/assets';
import { AssetSelector, AssetSelectorValue } from '@penumbra-zone/ui/AssetSelector';
import { getAssetId } from './utils';
import { useEpochResults } from '@/pages/tournament/api/use-epoch-results';
import { useCurrentEpoch } from '@/pages/tournament/api/use-current-epoch';

const Tabs = {
  AllLPs: 'All LPs',
  MyLPs: 'My LPs',
} as const;

type Tab = (typeof Tabs)[keyof typeof Tabs];

export const LPLeaderboard = observer(
  ({ epoch: propEpoch, showEpoch }: { epoch?: number; showEpoch?: boolean }) => {
    const { connected, subaccount } = connectionStore;
    const totalRef = useRef<number>(0);
    const searchParams = useSearchParams();
    const page = Number(searchParams?.get('page') ?? 1);
    const [currentPage, setCurrentPage] = useState(page);
    const [parent] = useAutoAnimate();
    const [tab, setTab] = useState<Tab>(Tabs.AllLPs);
    const [limit, setLimit] = useState(10);
    const { getTableHeader, sortBy } = useSortableTableHeaders<LpLeaderboardSortKey>('points');
    const [selectedAsset, setSelectedAsset] = useState<AssetSelectorValue>();

    const getAssetMetadata = useGetMetadata();
    const { data: umMetadata } = useStakingTokenMetadata();
    const { epoch: currentEpoch } = useCurrentEpoch();
    const epoch = propEpoch ?? currentEpoch;

    const handleAssetChange = (next?: AssetSelectorValue) => {
      setSelectedAsset(prev => (getAssetId(prev) === getAssetId(next) ? undefined : next));
    };

    const {
      data: leaderboard,
      error: leaderboardError,
      isPending: leaderboardLoading,
    } = useLpLeaderboard({
      epoch,
      page: currentPage,
      limit,
      sortKey: sortBy.key,
      sortDirection: sortBy.direction,
      assetId: getAssetId(selectedAsset),
      isActive: tab === Tabs.AllLPs,
    });

    const isMyTab = tab === Tabs.MyLPs;
    const {
      data: myLeaderboard,
      error: myLeaderboardError,
      isPending: myLeaderboardLoading,
    } = useMyLpLeaderboard({
      subaccount,
      epoch,
      page: currentPage,
      limit,
      sortKey: sortBy.key,
      sortDirection: sortBy.direction,
      assetId: getAssetId(selectedAsset),
      isActive: isMyTab,
    });

    const { data: assetsData, assetGauges } = useEpochResults('epoch-results-vote-dialog', {
      epoch,
      limit: 30,
      page: 1,
    });

    // Collect an array of minium 5 items. If there are more than 5 voted assets, return all of them.
    // If less than 5, firstly return all voted assets, and then fill the rest with non-voted assets.
    const metadataAssets = useMemo(() => {
      const base = assetsData?.data ?? [];
      const extra =
        base.length < 5 ? assetGauges.slice(base.length, base.length + 5 - base.length) : [];

      return [...base, ...extra].map(g => g.asset);
    }, [assetsData?.data, assetGauges]);

    const [positions, total, error, isLoading] = isMyTab
      ? [myLeaderboard?.data, myLeaderboard?.total, myLeaderboardError, myLeaderboardLoading]
      : [leaderboard?.data, leaderboard?.total, leaderboardError, leaderboardLoading];
    totalRef.current = total ?? totalRef.current;

    return (
      <Card>
        <div className='px-2'>
          <div className='flex gap-3 items-center mb-4'>
            <div className='flex flex-col gap-1'>
              <Text xxl color='text.primary'>
                LP Leaderboard
                {showEpoch && !!epoch && (
                  <div className='desktop:ml-3 inline-flex items-center rounded-sm bg-base-black-alt px-2'>
                    <div className='text-transparent bg-clip-text bg-[linear-gradient(90deg,rgb(244,156,67),rgb(83,174,168))]'>
                      <Text xxl>Epoch #{epoch}</Text>
                    </div>
                  </div>
                )}
              </Text>
              <Text small color='text.secondary'>
                Liquidity positions from the current epoch that have executed trades.
              </Text>
            </div>

            <div className='min-w-[80px] ml-auto rounded-full overflow-hidden'>
              <AssetSelector
                assets={metadataAssets}
                balances={undefined}
                value={selectedAsset}
                onChange={handleAssetChange}
              />
            </div>
          </div>

          {error ? (
            <Text large color='destructive.light'>
              {error.message}
            </Text>
          ) : (
            <>
              {connected && (
                <div className='[&>*>*]:w-1/2 mb-4'>
                  <SegmentedControl
                    value={tab}
                    onChange={opt => setTab(opt as 'All LPs' | 'My LPs')}
                  >
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

              <div className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] h-auto overflow-auto'>
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
                  <div ref={parent} className='contents col-span-6'>
                    {positions?.length ? (
                      positions.map(position => {
                        return (
                          <Link
                            key={position.positionIdString}
                            href={`/inspect/lp/${position.positionIdString}`}
                            className={cn(
                              'relative grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] col-span-6',
                              'bg-transparent hover:bg-action-hover-overlay transition-colors',
                              '*:h-auto',
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
                              <div className='flex gap-1 flex-col'>
                                <ValueViewComponent
                                  valueView={pnum(position.umVolume).toValueView(umMetadata)}
                                  abbreviate={true}
                                  density='slim'
                                />
                                <ValueViewComponent
                                  valueView={pnum(position.assetVolume).toValueView(
                                    getAssetMetadata(position.assetId),
                                  )}
                                  abbreviate={true}
                                  density='slim'
                                />
                              </div>
                            </TableCell>
                            <TableCell cell>
                              <div className='flex gap-1 flex-col'>
                                <ValueViewComponent
                                  valueView={pnum(position.umFees).toValueView(umMetadata)}
                                  abbreviate={true}
                                  density='slim'
                                />
                                <ValueViewComponent
                                  valueView={pnum(position.assetFees).toValueView(
                                    getAssetMetadata(position.assetId),
                                  )}
                                  abbreviate={true}
                                  density='slim'
                                />
                              </div>
                            </TableCell>
                            <TableCell cell>
                              <Text smallTechnical>
                                {stateToString(position.position.state?.state)}
                              </Text>
                            </TableCell>
                          </Link>
                        );
                      })
                    ) : (
                      <div className='col-span-6'>
                        <div className='grid grid-cols-subgrid col-span-4'>
                          <TableCell cell>
                            <span className='text-sm!'>
                              {tab === Tabs.AllLPs
                                ? 'There are no liquidity positions in this epoch.'
                                : 'Your LPs have not received any rewards during this epoch.'}
                            </span>
                          </TableCell>
                        </div>
                      </div>
                    )}
                  </div>
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
            </>
          )}
        </div>
      </Card>
    );
  },
);
