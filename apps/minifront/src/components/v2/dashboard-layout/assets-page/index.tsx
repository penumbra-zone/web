import { Density } from '@repo/ui/Density';
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
import { Button } from '@repo/ui/Button';
import { ArrowRightLeft } from 'lucide-react';

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

const BUTTON_CELL_WIDTH_PX = '56px';

export const AssetsPage = () => {
  const balancesByAccount = useBalancesResponses({
    select: filteredBalancesByAccountSelector,
    shouldReselect: (before, after) => before?.data !== after.data,
  });

  return (
    <>
      {balancesByAccount?.map(account => (
        <Table key={account.account} layout='fixed' title={<TableTitle account={account} />}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th width={`calc(50% - (${BUTTON_CELL_WIDTH_PX} / 2))`}>Asset</Table.Th>
              <Table.Th width={`calc(50% - (${BUTTON_CELL_WIDTH_PX} / 2))`}>Estimate</Table.Th>
              <Table.Th width={BUTTON_CELL_WIDTH_PX} />
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
                  <Link to={getTradeLink(balance)}>
                    <Density compact>
                      <Button icon={ArrowRightLeft} iconOnly>
                        Trade
                      </Button>
                    </Density>
                  </Link>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ))}
    </>
  );
};
