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
import { displayUsd, fromBaseUnitAmount, shortenAddress } from '@penumbra-zone/types';
import { useBalancesByAccount } from '../../hooks/balances';

export default function AssetsTable() {
  const { data, error } = useBalancesByAccount();

  if (data.length === 0) {
    return (
      <div className='flex flex-col gap-6'>
        <p>
          No balances found. Try requesting tokens by pasting your address in{' '}
          <a style={{ color: '#aaaaff' }} href='https://discord.gg/CDNEnzX6YC'>
            the faucet channel
          </a>{' '}
          on Discord!
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      {data.map(a => {
        return (
          <div key={a.index} className='flex flex-col gap-4'>
            <div className='flex flex-col items-center justify-center'>
              <div className='flex items-center justify-center gap-2'>
                <Identicon name={a.address} size={20} className='rounded-full' />
                <h2 className='font-bold md:text-base xl:text-xl'>Account #{a.index}</h2>{' '}
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
                        <p className='font-mono text-base font-bold'>{asset.denom.display}</p>
                      </div>
                    </TableCell>
                    <TableCell className='w-1/3 text-center font-mono'>
                      <div className='flex flex-col'>
                        <p className='text-base font-bold'>
                          {fromBaseUnitAmount(asset.amount, asset.denom.exponent).toFormat()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className='w-1/3 text-center font-mono'>
                      <div className='flex flex-col'>
                        <p className='text-base font-bold'>
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
