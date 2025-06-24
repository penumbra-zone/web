'use client';

import { Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import { useSortableTableHeaders } from '@/pages/tournament/ui/sortable-table-header';
import { Density } from '@penumbra-zone/ui/Density';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { connectionStore } from '@/shared/model/connection';

export const LiquidityTable = observer(() => {
  const { connected, subaccount } = connectionStore;
  const { getTableHeader, sortBy } = useSortableTableHeaders('date');
  const sortedLPs = [];

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
