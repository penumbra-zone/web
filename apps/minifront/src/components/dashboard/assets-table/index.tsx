import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { AddressComponent, AddressIcon } from '@repo/ui/components/ui/address';
import { Button } from '@repo/ui/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/ui/table';
import { ValueViewComponent } from '@repo/ui/components/ui/value';
import { EquivalentValues } from './equivalent-values';
import { Fragment } from 'react';
import { PagePath } from '../../metadata/paths';
import { Link } from 'react-router-dom';
import { getMetadataFromBalancesResponseOptional } from '@penumbra-zone/getters/balances-response';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { BalancesByAccount, groupByAccount, useBalancesResponses } from '../../../state/shared';
import { AbridgedZQueryState } from '@penumbra-zone/zquery/src/types';
import { shouldDisplay } from '../../../fetchers/balances/should-display';
import { sortByPriorityScore } from '../../../fetchers/balances/by-priority-score';
import { Oval } from 'react-loader-spinner';

const getTradeLink = (balance: BalancesResponse): string => {
  const metadata = getMetadataFromBalancesResponseOptional(balance);
  const accountIndex = getAddressIndex(balance.accountAddress).account;
  const accountQuery = accountIndex ? `&account=${accountIndex}` : '';
  return metadata ? `${PagePath.SWAP}?from=${metadata.symbol}${accountQuery}` : PagePath.SWAP;
};

const filteredBalancesByAccountSelector = (
  zQueryState: AbridgedZQueryState<BalancesResponse[]>,
): BalancesByAccount[] =>
  zQueryState.data?.filter(shouldDisplay).sort(sortByPriorityScore).reduce(groupByAccount, []) ??
  [];

export default function AssetsTable() {
  const balancesByAccount = useBalancesResponses({
    select: filteredBalancesByAccountSelector,
    shouldReselect: (before, after) => before?.data !== after.data,
  });

  /** Are assets still loading */
  const isLoading = balancesByAccount === undefined;

  if (isLoading) {
    return (
      <div className='mt-5 flex w-full flex-col items-center justify-center'>
        <Oval width={32} height={32} color='white' secondaryColor='white' />
      </div>
    );
  }

  if (balancesByAccount.length === 0) {
    return (
      <div className='mt-5 flex flex-col items-center gap-6'>
        <p>
          No balances found.{' '}
          <Link to='/ibc' style={{ color: '#aaaaff' }}>
            Try shielding funds
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className='w-full overflow-x-auto'>
      <Table>
        {balancesByAccount.map(account => (
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
                <TableHead>Value</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {account.balances.map((assetBalance, index) => (
                <TableRow className='group' key={index}>
                  <TableCell>
                    <ValueViewComponent view={assetBalance.balanceView} />
                  </TableCell>
                  <TableCell>
                    <EquivalentValues valueView={assetBalance.balanceView} />
                  </TableCell>
                  <TableCell>
                    <Link
                      className='transition group-hover:opacity-100 md:opacity-0'
                      to={getTradeLink(assetBalance)}
                    >
                      <Button variant='secondary' size='md'>
                        Trade
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Fragment>
        ))}
      </Table>
    </div>
  );
}
