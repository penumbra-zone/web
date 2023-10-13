'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui';
import { useBalancesWithMetadata } from '../../hooks/sorted-asset';
import { formatNumber } from '../../utils';

export default function AssetsTable() {
  const { data, error } = useBalancesWithMetadata('usdcValue');

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead className='text-center'>Account</TableHead>
          <TableHead className='text-center'>Price</TableHead>
          <TableHead className='text-center'>Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {error}
        {data.map((asset, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className='flex items-center gap-4'>
                <p className='text-base'>{asset.denomMetadata.display}</p>
              </div>
            </TableCell>
            <TableCell className='text-center'>{asset.account}</TableCell>
            <TableCell className='text-center'>{asset.assetId}</TableCell>
            <TableCell className='text-center'>
              <div className='flex flex-col'>
                <p className='text-[15px] leading-[22px]'>
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
