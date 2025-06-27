'use client';

import { Fragment, useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import orderBy from 'lodash/orderBy';
import { useSortableTableHeaders } from '@/pages/tournament/ui/sortable-table-header';
import { Density } from '@penumbra-zone/ui/Density';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { connectionStore } from '@/shared/model/connection';
import { useLps } from '../api/use-lps';
import { getDisplayLPs, DisplayLP } from '../model/get-display-lps';
import { useRegistry } from '@/shared/api/registry';
import { useGetMetadata } from '@/shared/api/assets';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';

export const LiquidityTable = observer(() => {
  const { connected, subaccount } = connectionStore;
  const { getTableHeader, sortBy } = useSortableTableHeaders<keyof DisplayLP>('date');

  const { data, isLoading } = useLps(subaccount);
  const { data: registry } = useRegistry();
  const usdc = Object.values(registry?.assetById).find(asset => asset?.symbol === 'USDC');
  const usdcMetadata = useGetMetadata()(usdc?.penumbraAssetId);
  console.log('TCL: LiquidityTable -> usdcMetadata', usdcMetadata);
  const displayPositions = getDisplayLPs({
    usdcMetadata,
    positionBundles: data,
  });
  console.log('TCL: LiquidityTable -> displayPositions', displayPositions);

  const sortedLPs = useMemo<DisplayLP[]>(() => {
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

        {sortedLPs.map((lp, index) => (
          <div key={`${lp.date}${index}`} className='col-span-10 grid grid-cols-subgrid'>
            <TableCell>{lp.date}</TableCell>
            <TableCell>{lp.liquidityShape}</TableCell>
            <TableCell>{lp.status}</TableCell>
            <TableCell>
              <ValueViewComponent valueView={lp.minPrice} />
            </TableCell>
            <TableCell>
              <ValueViewComponent valueView={lp.maxPrice} />
            </TableCell>
            <TableCell>
              <ValueViewComponent valueView={lp.currentValue} />
            </TableCell>
            <TableCell>
              <ValueViewComponent valueView={lp.volume} />
            </TableCell>
            <TableCell>
              <ValueViewComponent valueView={lp.feesEarned} />
            </TableCell>
            <TableCell>{lp.pnl}</TableCell>
          </div>
        ))}
      </Density>
    </div>
  );
});
