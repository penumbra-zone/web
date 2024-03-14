import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { AddressIcon } from '@penumbra-zone/ui/components/ui/address-icon';
import { AddressComponent } from '@penumbra-zone/ui/components/ui/address-component';
import { BalancesByAccount, getBalancesByAccount } from '../../fetchers/balances/by-account';
import { Table, TableBody, TableCell, TableRow } from '@penumbra-zone/ui';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { throwIfPraxNotConnectedTimeout } from '@penumbra-zone/client';

export const AssetsLoader: LoaderFunction = async (): Promise<BalancesByAccount[]> => {
  await throwIfPraxNotConnectedTimeout();
  return await getBalancesByAccount();
};

export default function AssetsTable() {
  const data = useLoaderData() as BalancesByAccount[];

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
            <div className='flex max-w-full flex-col justify-center gap-2 md:flex-row'>
              <div className='flex items-center justify-center gap-2'>
                <AddressIcon address={a.address} size={20} />
                <h2 className='whitespace-nowrap font-bold md:text-base xl:text-xl'>
                  Account #{a.index.account}
                </h2>
              </div>

              <div className='max-w-72 truncate'>
                <AddressComponent address={a.address} />
              </div>
            </div>
          </div>

          <Table className='md:table'>
            <TableBody>
              {a.balances.map((assetBalance, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <ValueViewComponent view={assetBalance.balanceView} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
