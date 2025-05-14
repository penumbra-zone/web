import { Density } from '@penumbra-zone/ui-deprecated/Density';
import { Table } from '@penumbra-zone/ui-deprecated/Table';
import { BalancesByAccount, groupByAccount, useBalancesResponses } from '../../../../state/shared';
import { shouldDisplay } from '../../../../fetchers/balances/should-display';
import { sortByPriorityScore } from '../../../../fetchers/balances/by-priority-score';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { PagePath } from '../../../metadata/paths';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { AbridgedZQueryState } from '@penumbra-zone/zquery/src/types';
import { ValueViewComponent } from '@penumbra-zone/ui-deprecated/ValueViewComponent';
import { EquivalentValues } from './equivalent-values';
import { TableTitle } from './table-title';
import { Link } from 'react-router-dom';
import { Button } from '@penumbra-zone/ui-deprecated/Button';
import { ArrowRightLeft } from 'lucide-react';
import { useAnimationDeferredValue } from '@penumbra-zone/ui-deprecated/hooks/useAnimationDeferredValue';
import { ConditionalWrap } from '@penumbra-zone/ui-deprecated/ConditionalWrap';
import { LayoutGroup } from 'framer-motion';

const getTradeLink = (balance: BalancesResponse): string => {
  const metadata = getMetadataFromBalancesResponse.optional(balance);
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

  const deferredBalancesByAccount = useAnimationDeferredValue(balancesByAccount);

  return deferredBalancesByAccount?.map((account, index) => (
    <ConditionalWrap
      key={account.account}
      // Only wrap the first table in the `<LayoutGroup />`, since that's the
      // only one that will be animating when transitioning to the assets table.
      if={index === 0}
      then={children => <LayoutGroup id='portfolioContent'>{children}</LayoutGroup>}
    >
      <Table
        tableLayout='fixed'
        title={<TableTitle account={account} />}
        motion={{ layoutId: index === 0 ? 'table' : undefined }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th
              width={`calc(50% - (${BUTTON_CELL_WIDTH_PX} / 2))`}
              motion={{ layoutId: index === 0 ? 'th1' : undefined }}
            >
              Asset
            </Table.Th>
            <Table.Th
              width={`calc(50% - (${BUTTON_CELL_WIDTH_PX} / 2))`}
              motion={{ layoutId: index === 0 ? 'th2' : undefined }}
            >
              Estimate
            </Table.Th>
            <Table.Th
              width={BUTTON_CELL_WIDTH_PX}
              motion={{ layoutId: index === 0 ? 'th3' : undefined }}
            />
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
                <div className='h-8 w-10 overflow-hidden'>
                  <Link
                    to={getTradeLink(balance)}
                    className='block translate-x-full opacity-0 transition [tr:hover>td>div>&]:translate-x-0 [tr:hover>td>div>&]:opacity-100'
                  >
                    <Density compact>
                      <Button icon={ArrowRightLeft} iconOnly>
                        Trade
                      </Button>
                    </Density>
                  </Link>
                </div>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ConditionalWrap>
  ));
};
