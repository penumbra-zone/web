'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui';
import { FilledImage } from '../../shared';
import { useSortedAssets } from '../../hooks/sorted-asset';
import { formatNumber } from '../../utils';
import { useMemo } from 'react';

export default function AssetsTable() {
  const sortedAssets = useSortedAssets('usdc');

  const assettsWithPercentage = useMemo(() => {
    const sum = sortedAssets.reduce((acc, asset) => acc + asset.usdcValue, 0);

    return sortedAssets.map(asset => ({
      ...asset,
      percentageOf: (asset.usdcValue / sum) * 100,
    }));
  }, [sortedAssets]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead className='text-center'>Portfolio %</TableHead>
          <TableHead className='text-center'>Price (24hr)</TableHead>
          <TableHead className='text-center'>Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assettsWithPercentage
          .filter(asset => asset.usdcValue)
          .map(asset => (
            <TableRow key={asset.display}>
              <TableCell>
                <div className='flex items-center gap-4'>
                  {asset.icon && <FilledImage src={asset.icon} alt='Asset' className='h-6 w-6' />}
                  <p className='text-base font-bold'>{asset.display}</p>
                </div>
              </TableCell>
              <TableCell className='text-center'>{formatNumber(asset.percentageOf)}%</TableCell>
              <TableCell className='text-center'>
                <div className='flex flex-col'>
                  <p>$1,577.15</p>
                  <p className='text-[15px] font-normal leading-[22px] text-red'>
                    -$15.19 (-0.95%)
                  </p>
                </div>
              </TableCell>
              <TableCell className='text-center'>
                <div className='flex flex-col'>
                  <p className='text-[15px] font-bold leading-[22px]'>
                    {formatNumber(asset.balance)} {asset.display}
                  </p>
                  <p className='text-[15px] font-normal leading-[22px] text-muted-foreground'>
                    ${formatNumber(asset.usdcValue)}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
