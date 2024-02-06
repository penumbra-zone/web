import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { throwIfExtNotInstalled } from '../../fetchers/is-connected.ts';
import { AddressIcon } from '@penumbra-zone/ui/components/ui/address-icon';
import { AddressComponent } from '@penumbra-zone/ui/components/ui/address-component';
import {
  AccountGroupedBalances,
  getBalancesByAccount,
} from '../../fetchers/balances/by-account.ts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@penumbra-zone/ui';
import { AssetIcon } from '../shared/asset-icon.tsx';
import { displayUsd, hasDenomMetadata } from '@penumbra-zone/types';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value.tsx';

export const AssetsLoader: LoaderFunction = async (): Promise<AccountGroupedBalances[]> => {
  throwIfExtNotInstalled();
  return await getBalancesByAccount();
};

export default function AssetsTable() {
  const data = useLoaderData() as AccountGroupedBalances[];

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
      {data.map((a, index) => (
        <div key={index} className='flex flex-col gap-4'>
          <div className='flex flex-col items-center justify-center'>
            <div className='flex flex-col items-center justify-center gap-2 md:flex-row'>
              <div className='flex items-center gap-2'>
                <AddressIcon address={a.address} size={20} />
                <h2 className='font-bold md:text-base xl:text-xl'>Account #{a.index.account}</h2>
              </div>
              <AddressComponent address={a.address} />
            </div>
          </div>

          <Table className='md:table'>
            <TableHeader>
              <TableRow>
                <TableHead className='w-1/3 text-center'>Asset</TableHead>
                <TableHead className='w-1/3 text-center'>Balance</TableHead>
                <TableHead className='w-1/3 text-center'>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {a.balances.map((assetBalance, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className='w-1/3'>
                      <div className='flex items-center gap-2'>
                        {hasDenomMetadata(assetBalance.value) && (
                          <>
                            <AssetIcon metadata={assetBalance.value.valueView.value.metadata} />
                            <p className='font-mono text-base font-bold'>
                              {assetBalance.value.valueView.value.metadata.display}
                            </p>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='w-1/3 text-center font-mono'>
                      <div className='flex flex-col items-center text-base font-bold'>
                        <ValueViewComponent view={assetBalance.value} showDenom={false} />
                      </div>
                    </TableCell>
                    <TableCell className='w-1/3 text-center font-mono'>
                      <div className='flex flex-col'>
                        <p className='text-base font-bold'>
                          {assetBalance.usdcValue == 0
                            ? '$–'
                            : `$${displayUsd(assetBalance.usdcValue)}`}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
