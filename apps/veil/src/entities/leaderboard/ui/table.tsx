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
import { getAssetId } from './utils';
import { useTournamentSummary } from '@/pages/tournament/api/use-tournament-summary';
import { useCurrentEpoch } from '@/pages/tournament/api/use-current-epoch';
import { useLpLeaderboard } from '@/pages/tournament/api/use-lp-leaderboard';
import { LpLeaderboardSortKey } from '@/pages/tournament/server/lp-leaderboard';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { pnum } from '@penumbra-zone/types/pnum';

export const LeaderboardTable = () => {
  const totalRef = useRef<number>(0);
  const searchParams = useSearchParams();
  const page = Number(searchParams?.get('page') ?? 1);
  const [currentPage, setCurrentPage] = useState(page);
  const [parent] = useAutoAnimate();
  const [quote, setQuote] = useState<AssetSelectorValue>();
  const [tab, setTab] = useState<'All LPs' | 'My LPs'>('All LPs');
  const [limit, setLimit] = useState(10);
  const quoteAssetId = getAssetId(quote);
  const { getTableHeader, sortBy } = useSortableTableHeaders<LpLeaderboardSortKey>('epoch');

  const { data: assets } = useAssets();

  const getAssetMetadata = useCallback(
    (assetId: AssetId) => {
      return assets?.find(asset => asset.penumbraAssetId?.equals(assetId));
    },
    [assets],
  );

  console.log('TCL: LeaderboardTable -> assets', assets);
  const umMetadata = useMemo(() => {
    return assets?.find(asset => asset.symbol === 'UM');
  }, [assets]);

  const { epoch, isLoading: epochLoading } = useCurrentEpoch();
  const { data: summary } = useTournamentSummary(
    {
      limit: 1,
      page: 1,
      epoch,
    },
    epochLoading,
  );

  const {
    data: leaderboard,
    error,
    isLoading,
  } = useLpLeaderboard(1300, currentPage, limit, sortBy.key, sortBy.direction);
  console.log('TCL: LeaderboardTable -> leaderboard', leaderboard);

  // const {
  //   data: myLPs,
  //   error: myLPsError,
  //   isLoading: myLPsLoading,
  // } = useMyLeaderboard({
  //   limit,
  //   offset: (currentPage - 1) * limit,
  //   quote: quoteAssetId,
  //   startBlock: summary?.[0]?.start_block,
  //   endBlock: summary?.[0]?.end_block,
  // });

  const { data: balances } = useBalances();
  const { data: positions, total } = leaderboard ?? {};
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

        <div className='[&>*>*]:w-1/2 mb-4'>
          <SegmentedControl value={tab} onChange={opt => setTab(opt as 'All LPs' | 'My LPs')}>
            <SegmentedControl.Item
              value='All LPs'
              style={tab === 'All LPs' ? 'filled' : 'unfilled'}
            >
              All LPs
            </SegmentedControl.Item>
            <SegmentedControl.Item value='My LPs' style={tab === 'My LPs' ? 'filled' : 'unfilled'}>
              My LPs
            </SegmentedControl.Item>
          </SegmentedControl>
        </div>

        <div ref={parent} className='grid grid-cols-7 h-auto overflow-auto'>
          <div className='grid grid-cols-subgrid col-span-8'>
            {getTableHeader('positionId', 'Position ID')}
            {getTableHeader('executions', 'Execs')}
            {getTableHeader('points', 'Points')}
            {/* {getTableHeader('pnlPercentage', 'PnL')} */}
            {/* {getTableHeader('age', 'Age')} */}
            <TableCell heading>Volume</TableCell>
            <TableCell heading>Fees</TableCell>
            <TableCell heading>State</TableCell>
          </div>

          {isLoading ? (
            Array.from({ length: limit }).map((_, index) => (
              <div className='grid grid-cols-subgrid col-span-8' key={index}>
                <TableCell loading>&nbsp;</TableCell>
                <TableCell loading>&nbsp;</TableCell>
                <TableCell loading>&nbsp;</TableCell>
                {/* <TableCell loading>&nbsp;</TableCell> */}
                {/* <TableCell loading>&nbsp;</TableCell> */}
                <TableCell loading>&nbsp;</TableCell>
                <TableCell loading>&nbsp;</TableCell>
                <TableCell loading>&nbsp;</TableCell>
              </div>
            ))
          ) : (
            <>
              {positions.length ? (
                positions.map(position => {
                  return (
                    <Link
                      key={position.positionIdString}
                      href={`/inspect/lp/${position.positionIdString}`}
                      className={cn(
                        'relative grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] col-span-7',
                        'bg-transparent hover:bg-action-hoverOverlay transition-colors',
                        '[&>*]:h-auto',
                      )}
                    >
                      <TableCell cell numeric>
                        <div className='flex max-w-[104px]'>
                          <Text as='div' detailTechnical color='text.primary' truncate>
                            {position.positionIdString}
                          </Text>
                          <span>
                            <SquareArrowOutUpRight className='w-4 h-4 text-text-secondary' />
                          </span>
                        </div>
                      </TableCell>
                      <TableCell cell numeric>
                        {position.executions}
                      </TableCell>
                      <TableCell cell numeric loading={isLoading}>
                        {Math.abs(position.pointsShare)}%
                      </TableCell>
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
                      <TableCell cell numeric>
                        <ValueViewComponent
                          valueView={pnum(position.umVolume).toValueView(umMetadata)}
                          abbreviate={true}
                          density='slim'
                        />
                      </TableCell>
                      <TableCell cell numeric>
                        <ValueViewComponent
                          valueView={pnum(position.assetFees).toValueView(
                            getAssetMetadata(position.assetId),
                          )}
                          abbreviate={true}
                          density='slim'
                        />
                      </TableCell>
                      <TableCell cell numeric>
                        {stateToString(position.position.state?.state)}
                      </TableCell>
                    </Link>
                  );
                })
              ) : (
                <div className='col-span-6'>
                  <TableCell>There are no liquidity positions in this epoch.</TableCell>
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
};
