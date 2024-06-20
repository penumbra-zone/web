import { AddressComponent, AddressIcon } from '@penumbra-zone/ui/components/ui/address';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@penumbra-zone/ui/components/ui/table';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/value';
import { EquivalentValues } from './equivalent-values';
import { Fragment } from 'react';
import { shouldDisplay } from './helpers';
import { useBalancesByAccount } from '../../../state/balances';

export default function AssetsTable() {
  const balancesByAccount = useBalancesByAccount();

  if (balancesByAccount.data?.length === 0) {
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
      {balancesByAccount.data?.map(account => (
        <Fragment key={account.account}>
          <TableHeader className='group'>
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
            {account.balances.filter(shouldDisplay).map((assetBalance, index) => (
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
        </Fragment>
      ))}
    </Table>
  );
}
