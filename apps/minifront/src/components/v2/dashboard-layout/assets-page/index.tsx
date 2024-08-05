import { Table } from '@repo/ui/Table';
import { BalancesByAccount, groupByAccount, useBalancesResponses } from '../../../../state/shared';
import { shouldDisplay } from '../../../../fetchers/balances/should-display';
import { sortByPriorityScore } from '../../../../fetchers/balances/by-priority-score';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getMetadataFromBalancesResponseOptional } from '@penumbra-zone/getters/balances-response';
import { PagePath } from '../../../metadata/paths';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { AbridgedZQueryState } from '@penumbra-zone/zquery/src/types';
import { ValueViewComponent } from '@repo/ui/ValueViewComponent';
import { EquivalentValues } from './equivalent-values';
import { TableTitle } from './table-title';
import { Link } from 'react-router-dom';

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

const BUTTON_WIDTH_PX = 100;

export const AssetsPage = () => {
  const balancesByAccount = useBalancesResponses({
    select: filteredBalancesByAccountSelector,
    shouldReselect: (before, after) => before?.data !== after.data,
  });

  return (
    <div className='flex flex-col gap-1'>
      {balancesByAccount?.map(account => (
        <Table key={account.account} layout='fixed' title={<TableTitle account={account} />}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th width={`calc(50% - ${BUTTON_WIDTH_PX / 2}px)`}>Asset</Table.Th>
              <Table.Th width={`calc(50% - ${BUTTON_WIDTH_PX / 2}px)`}>Estimate</Table.Th>
              <Table.Th width={`${BUTTON_WIDTH_PX}px`} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {account.balances.map((balance, index) => (
              <Table.Tr key={index}>
                <Table.Td vAlign='top'>
                  <ValueViewComponent valueView={balance.balanceView} context='table' />
                </Table.Td>
                <Table.Td vAlign='top'>
                  <EquivalentValues valueView={balance.balanceView} />
                </Table.Td>

                <Table.Td>
                  <Link
                    className='opacity-0 transition [tr:hover>td>&]:opacity-100'
                    to={getTradeLink(balance)}
                  >
                    Trade
                  </Link>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ))}
    </div>
  );
};
