'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui';
import { FilledImage } from '../../shared';
import { useSortedAssets } from '../../hooks/sorted-asset';
import { formatNumber } from '../../utils';
import { useMemo } from 'react';

export default function AssetsTable() {
  const sortedAssets = useSortedAssets('usdcValue');

  const assetsWithPercentage = useMemo(() => {
    const sum = sortedAssets.reduce((acc, asset) => acc + asset.balance.usdcValue, 0);

    return sortedAssets.map(asset => ({
      ...asset,
      percentageOf: (asset.balance.usdcValue / sum) * 100,
    }));
  }, [sortedAssets]);

  console.log(assetsWithPercentage);

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
        {assetsWithPercentage
          .filter(asset => asset.balance.usdcValue)
          .map(asset => (
            <TableRow key={asset.denomMetadata.display}>
              <TableCell>
                <div className='flex items-center gap-4'>
                  {asset.denomMetadata.icon && (
                    <FilledImage src={asset.denomMetadata.icon} alt='Asset' className='h-6 w-6' />
                  )}
                  <p className='text-base font-bold'>{asset.denomMetadata.display}</p>
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
                    {formatNumber(asset.balance.amount)} {asset.denomMetadata.display}
                  </p>
                  <p className='text-[15px] font-normal leading-[22px] text-muted-foreground'>
                    ${formatNumber(asset.balance.usdcValue)}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
