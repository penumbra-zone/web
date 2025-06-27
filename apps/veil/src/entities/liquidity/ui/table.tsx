'use client';

import orderBy from 'lodash/orderBy';
import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useSortableTableHeaders } from '@/pages/tournament/ui/sortable-table-header';
import { Density } from '@penumbra-zone/ui/Density';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { connectionStore } from '@/shared/model/connection';
import { useLps } from '../api/use-lps';
import { getDisplayLPs, DisplayLP } from '../model/get-display-lps';
import { useRegistry } from '@/shared/api/registry';
import { useGetMetadata } from '@/shared/api/assets';
import { LiquidityRow } from './liquidity-row';
import { GroupedLiquidityRow } from './grouped-liquidity-row';

export const LiquidityTable = observer(() => {
  const { subaccount } = connectionStore;
  const { getTableHeader, sortBy } = useSortableTableHeaders<keyof DisplayLP>('date');

  const { data } = useLps(subaccount);
  const { data: registry } = useRegistry();
  const usdc = Object.values(registry?.assetById ?? {}).find(
    (asset: { symbol?: string }) => asset?.symbol === 'USDC',
  );
  const usdcMetadata = useGetMetadata()(usdc?.penumbraAssetId);
  const displayPositions = getDisplayLPs({
    usdcMetadata,
  });

  const sortedLPs = useMemo<DisplayLP[]>(() => {
    return orderBy([...displayPositions], `sortValues.${sortBy.key}`, sortBy.direction);
  }, [displayPositions, sortBy]);

  // Group LPs by directedPair using reduce
  const sortedLPsByPair = sortedLPs.reduce<Record<string, DisplayLP[]>>(
    (lpsByPair, displayLP) => ({
      ...lpsByPair,
      [displayLP.directedPair]: [...(lpsByPair[displayLP.directedPair] ?? []), displayLP],
    }),
    {},
  );
  console.log('TCL: sortedLPsByPair', sortedLPsByPair);

  return (
    <div className='grid grid-cols-[80px_1fr_1fr_80px_1fr_1fr_1fr_1fr_1fr_1fr] overflow-x-auto overflow-y-auto'>
      <Density slim>
        <div className='col-span-10 grid grid-cols-subgrid'>
          {getTableHeader('date', 'Date')}
          {getTableHeader('liquidityShape', 'Liquidity Shape')}
          {getTableHeader('status', 'Status')}
          <TableCell heading>Min Price</TableCell>
          <TableCell heading>Max Price</TableCell>
          {getTableHeader('currentValue', 'Current Value')}
          {getTableHeader('volume', 'Volume')}
          {getTableHeader('feesEarned', 'Fees Earned')}
          {getTableHeader('pnl', 'PnL')}
          <TableCell heading>&nbsp;</TableCell>
        </div>

        {/* Show LPs directly when there's only one group */}
        {Object.keys(sortedLPsByPair).length === 1
          ? sortedLPs.map((lp, index) => <LiquidityRow key={`${lp.date}${index}`} lp={lp} />)
          : Object.entries(sortedLPsByPair).map(([pair, lps]) => (
              <GroupedLiquidityRow key={pair} pair={pair} lps={lps} />
            ))}
      </Density>
    </div>
  );
});
