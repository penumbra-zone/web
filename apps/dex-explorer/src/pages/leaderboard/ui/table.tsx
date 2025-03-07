'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useState, useMemo, useCallback } from 'react';
import cn from 'clsx';
import orderBy from 'lodash/orderBy';
import { Text } from '@penumbra-zone/ui/Text';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { SegmentedControl } from '@penumbra-zone/ui/SegmentedControl';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import Link from 'next/link';
import { SquareArrowOutUpRight, ChevronUp, ChevronDown } from 'lucide-react';
import {
  AssetSelector,
  AssetSelectorValue,
  isBalancesResponse,
} from '@penumbra-zone/ui/AssetSelector';
import { useAssets } from '@/shared/api/assets';
import { useBalances } from '@/shared/api/balances';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { useLeaderboard } from '@/pages/leaderboard/api/use-leaderboard';
import { DEFAULT_INTERVAL, LeaderboardIntervalFilter } from '../api/utils';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { pnum } from '@penumbra-zone/types/pnum';

const getAssetId = (value: AssetSelectorValue | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const metadata: Metadata = isBalancesResponse(value)
    ? getMetadataFromBalancesResponse(value)
    : value;

  return metadata.penumbraAssetId?.inner
    ? uint8ArrayToHex(metadata.penumbraAssetId.inner)
    : undefined;
};

export const LeaderboardTable = () => {
  const [parent] = useAutoAnimate();

  const [interval, setInterval] = useState(DEFAULT_INTERVAL);
  const [base, setBase] = useState<AssetSelectorValue>();
  const [quote, setQuote] = useState<AssetSelectorValue>();

  const [sortBy, setSortBy] = useState<{
    key: string;
    direction: 'desc' | 'asc';
  }>({
    key: 'volume2',
    direction: 'desc',
  });

  const baseAssetId = getAssetId(base);
  const quoteAssetId = getAssetId(quote);

  const {
    data: leaderboard,
    error,
    isLoading,
  } = useLeaderboard({
    limit: 30,
    interval,
    base: baseAssetId,
    quote: quoteAssetId,
  });

  const { data: assets } = useAssets();
  const { data: balances } = useBalances();
  const { data: positions } = leaderboard ?? {};

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

  const SortableTableHeader = useCallback(
    ({ sortKey, children }: { sortKey: string; children: React.ReactNode }) => {
      return (
        <TableCell heading>
          <button
            className='flex'
            onClick={() => {
              setSortBy({
                key: sortKey,
                direction: sortBy.key === sortKey && sortBy.direction === 'desc' ? 'asc' : 'desc',
              });
            }}
          >
            <Text
              tableHeadingSmall
              whitespace='nowrap'
              color={sortBy.key === sortKey ? 'text.primary' : 'text.secondary'}
            >
              {children}
            </Text>
            {sortKey === sortBy.key && (
              <>
                {sortBy.direction === 'asc' ? (
                  <ChevronUp className='w-4 h-4 text-text-primary' />
                ) : (
                  <ChevronDown className='w-4 h-4 text-text-primary' />
                )}
              </>
            )}
          </button>
        </TableCell>
      );
    },
    [sortBy, setSortBy],
  );

  if (error) {
    return (
      <Text large color='destructive.light'>
        {error.message}
      </Text>
    );
  }

  return (
    <>
      <div className='flex gap-4 justify-between items-center text-text-primary'>
        <Text large whitespace='nowrap'>
          Leaderboard
        </Text>

        <div className='flex gap-1 items-center'>
          <div className='mr-2'>
            <SegmentedControl
              value={interval}
              onChange={value => setInterval(value as LeaderboardIntervalFilter)}
            >
              <SegmentedControl.Item value='1h' />
              <SegmentedControl.Item value='6h' />
              <SegmentedControl.Item value='24h' />
              <SegmentedControl.Item value='7d' />
              <SegmentedControl.Item value='30d' />
            </SegmentedControl>
          </div>

          <AssetSelector assets={assets} balances={balances} value={base} onChange={setBase} />
          <Text large color='text.secondary'>
            /
          </Text>
          <AssetSelector assets={assets} balances={balances} value={quote} onChange={setQuote} />
        </div>
      </div>

      <div ref={parent} className='grid grid-cols-6 h-auto overflow-auto'>
        <div className='grid grid-cols-subgrid col-span-6'>
          <SortableTableHeader sortKey='positionId'>Position</SortableTableHeader>
          <SortableTableHeader sortKey='executions'>Executions</SortableTableHeader>
          <SortableTableHeader sortKey='fees1'>Fees1</SortableTableHeader>
          <SortableTableHeader sortKey='volume1'>Volume1</SortableTableHeader>
          <SortableTableHeader sortKey='fees2'>Fees2</SortableTableHeader>
          <SortableTableHeader sortKey='volume2'>Volume2</SortableTableHeader>
        </div>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div className='grid grid-cols-subgrid col-span-6' key={index}>
              <TableCell loading>--</TableCell>
              <TableCell loading>--</TableCell>
              <TableCell loading>--</TableCell>
              <TableCell loading>--</TableCell>
              <TableCell loading>--</TableCell>
              <TableCell loading>--</TableCell>
            </div>
          ))
        ) : (
          <>
            {sortedPositions.length ? (
              sortedPositions.map((position, index) => (
                <Link
                  href={`/inspect/lp/${position.positionId}`}
                  key={position.positionId}
                  className={cn(
                    'relative grid grid-cols-subgrid col-span-6',
                    'bg-transparent hover:bg-action-hoverOverlay transition-colors',
                  )}
                >
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
                  <TableCell
                    numeric
                    variant={index !== sortedPositions.length - 1 ? 'cell' : 'lastCell'}
                  >
                    {position.executions}
                  </TableCell>
                  <TableCell
                    numeric
                    variant={index !== sortedPositions.length - 1 ? 'cell' : 'lastCell'}
                  >
                    <ValueViewComponent valueView={position.fees1} abbreviate={true} />
                  </TableCell>
                  <TableCell
                    numeric
                    variant={index !== sortedPositions.length - 1 ? 'cell' : 'lastCell'}
                  >
                    <ValueViewComponent valueView={position.volume1} abbreviate={true} />
                  </TableCell>
                  <TableCell
                    numeric
                    variant={index !== sortedPositions.length - 1 ? 'cell' : 'lastCell'}
                  >
                    <ValueViewComponent valueView={position.fees2} abbreviate={true} />
                  </TableCell>
                  <TableCell
                    numeric
                    variant={index !== sortedPositions.length - 1 ? 'cell' : 'lastCell'}
                  >
                    <ValueViewComponent valueView={position.volume2} abbreviate={true} />
                  </TableCell>
                </Link>
              ))
            ) : (
              <div className='col-span-6'>
                <TableCell>Nothing to display.</TableCell>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
