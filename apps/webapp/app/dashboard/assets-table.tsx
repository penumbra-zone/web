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
import {
  displayAmount,
  displayUsd,
  fromBaseUnitAmount,
  shortenAddress,
} from '@penumbra-zone/types';

export default function AssetsTable() {
  const { data, error } = useBalancesWithMetadata();

  return (
    <div className='flex flex-col gap-6'>
      {data.map(a => {
        return (
          <div key={a.index} className='flex flex-col gap-4'>
            <div className='flex flex-col items-center justify-center'>
              <div className='flex items-center justify-center gap-2'>
                <Identicon name={a.address} size={20} className='rounded-full' />
                <h2 className='text-xl font-bold'>Account #{a.index}</h2>{' '}
                <div className='font-mono text-sm italic text-foreground'>
                  {shortenAddress(a.address)}
                </div>
              </div>
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
                        <p className=' font-mono text-base'>{asset.denom.display}</p>
                      </div>
                    </TableCell>
                    <TableCell className='w-1/3 text-center font-mono'>
                      <div className='flex flex-col'>
                        <p className='text-[15px] leading-[22px]'>
                          {displayAmount(fromBaseUnitAmount(asset.amount, asset.denom.exponent))}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className='w-1/3 text-center font-mono'>
                      <div className='flex flex-col'>
                        <p className=''>
                          {asset.usdcValue == 0 ? '$–' : `$${displayUsd(asset.usdcValue)}`}
                        </p>
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
