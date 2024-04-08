import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { AddressIcon } from '@penumbra-zone/ui/components/ui/address-icon';
import { AddressComponent } from '@penumbra-zone/ui/components/ui/address-component';
import { BalancesByAccount, getBalancesByAccount } from '../../../fetchers/balances/by-account';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@penumbra-zone/ui/components/ui/table';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { throwIfPraxNotConnectedTimeout } from '@penumbra-zone/client';
import { EquivalentValues } from './equivalent-values';

export const AssetsLoader: LoaderFunction = async (): Promise<BalancesByAccount[]> => {
  await throwIfPraxNotConnectedTimeout();
  return await getBalancesByAccount();
};

export default function AssetsTable() {
  const balancesByAccount = useLoaderData() as BalancesByAccount[];

  if (balancesByAccount.length === 0) {
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
    <Table>
      {balancesByAccount.map(account => (
        <>
          <TableHeader key={account.account} className='group'>
            <TableRow>
              <TableHead colSpan={2}>
                <div className='flex max-w-full flex-col justify-center gap-2 pt-8 group-[:first-of-type]:pt-0 md:flex-row'>
                  <div className='flex items-center justify-center gap-2'>
                    <AddressIcon address={account.address} size={20} />
                    <h2 className='whitespace-nowrap font-bold md:text-base xl:text-xl'>
                      Account #{account.account}
                    </h2>
                  </div>

                  <div className='max-w-72 truncate'>
                    <AddressComponent address={account.address} />
                  </div>
                </div>
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead>Balance</TableHead>
              <TableHead>Estimated equivalent(s)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {account.balances.map((assetBalance, index) => (
              <TableRow key={index}>
                <TableCell>
                  <ValueViewComponent view={assetBalance.balanceView} />
                </TableCell>
                <TableCell>
                  <EquivalentValues valueView={assetBalance.balanceView} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </>
      ))}
    </Table>
  );
}
