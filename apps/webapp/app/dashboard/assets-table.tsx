'use client';

import { useBalancesWithMetadata } from '../../hooks/sorted-asset';
import {
  Identicon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@penumbra-zone/ui';
import { shorten } from '@penumbra-zone/types';
import { formatNumber } from '../../utils';

export default function AssetsTable() {
  const { data, error } = useBalancesWithMetadata();

  return (
    <div className='flex flex-col gap-6'>
      {data.map(a => {
        return (
          <div key={a.index} className='flex flex-col gap-4'>
            <div className='flex flex-col items-center justify-center'>
              <div className='flex items-center justify-center gap-2'>
                <h2 className='text-xl font-bold'>Account: #{a.index}</h2>{' '}
                <Identicon name={a.address} className='h-4 w-4 rounded-full' />
              </div>
              <div className='text-sm italic text-foreground'>{shorten(a.address, 15)}</div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-1/3 text-center'>Asset</TableHead>
                  <TableHead className='w-1/3 text-center'>Balance</TableHead>
                  <TableHead className='w-1/3 text-center'>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {a.balances.map((asset, i) => (
                  <TableRow key={i}>
                    <TableCell className='w-1/3'>
                      <div className='flex flex-col items-center gap-4 '>
                        <p className=' text-base'>{asset.denom}</p>
                      </div>
                    </TableCell>
                    <TableCell className='w-1/3 text-center font-mono font-light'>
                      <div className='flex flex-col'>
                        <p className='text-[15px] leading-[22px]'>{formatNumber(asset.amount)}</p>
                      </div>
                    </TableCell>
                    <TableCell className='w-1/3 text-center font-mono font-light'>
                      <div className='flex flex-col'>
                        <p className=''>${formatNumber(asset.usdcValue)}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      })}
      {error ? <div className='text-red-700'>{String(error)}</div> : null}
    </div>
  );
}
