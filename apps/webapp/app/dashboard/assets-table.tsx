'use client';

import {
  Identicon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@penumbra-zone/ui';
import { useBalancesWithMetadata } from '../../hooks/sorted-asset';
import { formatNumber } from '../../utils';

export default function AssetsTable() {
  const { data, error } = useBalancesWithMetadata('usdcValue');

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='text-center'>Account</TableHead>
            <TableHead className='text-center'>Asset</TableHead>
            <TableHead className='text-center'>Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((asset, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className='flex flex-row items-center justify-center gap-2'>
                  <Identicon name={asset.account.address} className='h-4 w-4 rounded-full' />#
                  {asset.account.index}
                </div>
              </TableCell>
              <TableCell>
                <div className='flex flex-col items-center gap-4 '>
                  <p className=' text-base'>{asset.denomMetadata.display}</p>
                </div>
              </TableCell>
              <TableCell className='text-center font-mono font-light'>
                <div className='flex flex-col'>
                  <p className='text-[15px] leading-[22px]'>{formatNumber(asset.balance.amount)}</p>
                  {/* Enable when pricing ready */}
                  {/*<p className='text-[15px] font-normal leading-[22px] text-muted-foreground'>*/}
                  {/*  ${formatNumber(asset.balance.usdcValue)}*/}
                  {/*</p>*/}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {error && <div className='text-red-700'>{String(error)}</div>}
    </>
  );
}
