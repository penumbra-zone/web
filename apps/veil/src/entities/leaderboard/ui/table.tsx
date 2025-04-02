'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useState, useMemo, useRef } from 'react';
import cn from 'clsx';
import orderBy from 'lodash/orderBy';
import { Text } from '@penumbra-zone/ui/Text';
import { Card } from '@penumbra-zone/ui/Card';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { SegmentedControl } from '@penumbra-zone/ui/SegmentedControl';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import Link from 'next/link';
import { SquareArrowOutUpRight } from 'lucide-react';
import { AssetSelector, AssetSelectorValue } from '@penumbra-zone/ui/AssetSelector';
import { useAssets } from '@/shared/api/assets';
import { useBalances } from '@/shared/api/balances';
import { useLeaderboard } from '@/entities/leaderboard/api/use-leaderboard';
import { formatAge, getAssetId } from './utils';
import { stateToString } from '@/entities/position/model/state-to-string';
import { useSearchParams } from 'next/navigation';
import { pnum } from '@penumbra-zone/types/pnum';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { PointsPnl } from './points-pnl';
import { useSortableTableHeaders } from '@/pages/tournament/ui/sortable-table-header';

export const LeaderboardTable = ({
  startBlock,
  endBlock,
}: {
  startBlock: number;
  endBlock: number;
}) => {
  const totalCountRef = useRef<number>(0);
  const searchParams = useSearchParams();
  const page = Number(searchParams?.get('page') ?? 1);
  const [currentPage, setCurrentPage] = useState(page);
  console.log('TCL: currentPage', currentPage);
  const [parent] = useAutoAnimate();
  const [quote, setQuote] = useState<AssetSelectorValue>();
  const [tab, setTab] = useState<'All LPs' | 'My LPs'>('All LPs');
  const [limit, setLimit] = useState(10);
  const quoteAssetId = getAssetId(quote);
  const { getTableHeader, sortBy } = useSortableTableHeaders();

  const {
    data: leaderboard,
    error,
    isLoading,
  } = useLeaderboard({
    limit,
    offset: (currentPage - 1) * limit,
    quote: quoteAssetId,
    startBlock,
    endBlock,
  });

  const { data: assets } = useAssets();
  const { data: balances } = useBalances();
  const { data: positions, totalCount } = leaderboard ?? {};
  totalCountRef.current = totalCount ?? totalCountRef.current;
  console.log('TCL: totalCount', totalCount);
  console.log('TCL: positions', positions);

  const sortedPositions = useMemo(() => {
    return orderBy(
      (positions ?? []).map(position => ({
        ...position,
        sortValues: {
          positionId: position.positionId,
          executions: position.executions,
          fees1: pnum(position.fees1).toNumber(),
          volume1: pnum(position.volume1).toNumber(),
          fees2: pnum(position.fees2).toNumber(),
          volume2: pnum(position.volume2).toNumber(),
        },
      })),
      `sortValues.${sortBy.key}`,
      sortBy.direction,
    );
  }, [positions, sortBy]);

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

        <div ref={parent} className='grid grid-cols-8 h-auto overflow-auto'>
          <div className='grid grid-cols-subgrid col-span-8'>
            {getTableHeader('executions', 'Execs')}
            {getTableHeader('points', 'Points')}
            {getTableHeader('pnl', 'PnL')}
            {getTableHeader('age', 'Age')}
            {getTableHeader('volume', 'Volume')}
            {getTableHeader('fees', 'Fees')}
            {getTableHeader('state', 'State')}
            {getTableHeader('positionId', 'Position ID')}
          </div>

          {isLoading ? (
            Array.from({ length: limit }).map((_, index) => (
              <div className='grid grid-cols-subgrid col-span-8' key={index}>
                <TableCell loading>&nbsp;</TableCell>
                <TableCell loading>&nbsp;</TableCell>
                <TableCell loading>&nbsp;</TableCell>
                <TableCell loading>&nbsp;</TableCell>
                <TableCell loading>&nbsp;</TableCell>
                <TableCell loading>&nbsp;</TableCell>
                <TableCell loading>&nbsp;</TableCell>
                <TableCell loading>&nbsp;</TableCell>
              </div>
            ))
          ) : (
            <>
              {sortedPositions.length ? (
                sortedPositions.map((position, index) => {
                  const variant = index !== sortedPositions.length - 1 ? 'cell' : 'lastCell';

                  return (
                    <Link
                      href={`/inspect/lp/${position.positionId}`}
                      key={position.positionId}
                      className={cn(
                        'relative grid grid-cols-subgrid col-span-8',
                        'bg-transparent hover:bg-action-hoverOverlay transition-colors',
                        '[&>*]:h-auto',
                      )}
                    >
                      <TableCell numeric variant={variant}>
                        {position.executions}
                      </TableCell>
                      <TableCell numeric variant={variant} loading={isLoading}>
                        {Math.abs(position.pnlPercentage)}
                      </TableCell>
                      <TableCell numeric variant={variant} loading={isLoading}>
                        {position.pnlPercentage}
                      </TableCell>
                      <TableCell numeric variant={variant}>
                        {formatAge(position.openingTime)}
                      </TableCell>
                      <TableCell numeric variant={variant}>
                        <div className='flex flex-col gap-2 py-2'>
                          <ValueViewComponent
                            valueView={position.fees1}
                            abbreviate={true}
                            density='slim'
                          />
                          <ValueViewComponent
                            valueView={position.fees2}
                            abbreviate={true}
                            density='slim'
                          />
                        </div>
                      </TableCell>
                      <TableCell numeric variant={variant}>
                        <div className='flex flex-col gap-2 py-2'>
                          <ValueViewComponent
                            valueView={position.volume1}
                            abbreviate={true}
                            density='slim'
                          />
                          <ValueViewComponent
                            valueView={position.volume2}
                            abbreviate={true}
                            density='slim'
                          />
                        </div>
                      </TableCell>
                      <TableCell
                        numeric
                        variant={index !== sortedPositions.length - 1 ? 'cell' : 'lastCell'}
                      >
                        {stateToString(position.state)}
                      </TableCell>
                      <TableCell
                        numeric
                        variant={index !== sortedPositions.length - 1 ? 'cell' : 'lastCell'}
                      >
                        <div className='flex max-w-[104px]'>
                          <Text as='div' detailTechnical color='text.primary' truncate>
                            {position.positionId}
                          </Text>
                          <span>
                            <SquareArrowOutUpRight className='w-4 h-4 text-text-secondary' />
                          </span>
                        </div>
                      </TableCell>
                    </Link>
                  );
                })
              ) : (
                <div className='col-span-6'>
                  <TableCell>Nothing to display.</TableCell>
                </div>
              )}
            </>
          )}
        </div>

        <div className='pt-4'>
          <Pagination
            value={currentPage}
            totalItems={totalCountRef.current}
            limit={limit}
            onLimitChange={setLimit}
            onChange={setCurrentPage}
          />
        </div>
      </div>
    </Card>
  );
};
