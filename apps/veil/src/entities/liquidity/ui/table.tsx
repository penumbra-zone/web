'use client';

import { Fragment, useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import orderBy from 'lodash/orderBy';
import { useSortableTableHeaders } from '@/pages/tournament/ui/sortable-table-header';
import { Density } from '@penumbra-zone/ui/Density';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { connectionStore } from '@/shared/model/connection';
import { useLps } from '../api/use-lps';
import { getDisplayLPs, DisplayLPs } from '../model/get-display-lps';

export const LiquidityTable = observer(() => {
  const { connected, subaccount } = connectionStore;
  const { getTableHeader, sortBy } = useSortableTableHeaders('date');

  const { data, isLoading } = useLps(subaccount);
  const displayPositions = getDisplayLPs({
    positionBundles: data,
  });

  const [sortBy, setSortBy] = useState<{
    key: string;
    direction: 'desc' | 'asc';
  }>({
    key: 'effectivePrice',
    direction: 'desc',
  });

  const sortedPositions = useMemo<DisplayPosition[]>(() => {
    return orderBy([...displayPositions], `sortValues.${sortBy.key}`, sortBy.direction);
  }, [displayPositions, sortBy]);

  return (
    <div
      className='grid grid-cols-[80px_1fr_1fr_80px_1fr_1fr_1fr_1fr_1fr_1fr] overflow-x-auto overflow-y-auto'
      style={{ overflowAnchor: 'none' }}
    >
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

        {sortedLPs.map((position, index) => (
          <Fragment key={`${position.idString}${index}`}>asd</Fragment>
        ))}
      </Density>
    </div>
  );
});
