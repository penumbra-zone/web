import { getDisplayDenomFromView } from '@penumbra-zone/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@penumbra-zone/ui';
import { BalancesByAccount } from '../../../fetchers/balances/by-account';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { useMemo } from 'react';
import { assetPatterns } from '@penumbra-zone/constants';

export const Account = ({ account }: { account: BalancesByAccount }) => {
  const { unstakedBalance, delegationBalances } = useMemo(
    () => ({
      unstakedBalance: account.balances.find(
        balance => getDisplayDenomFromView(balance.value) === 'penumbra',
      ),
      delegationBalances: account.balances.filter(balance =>
        assetPatterns.delegationTokenPattern.test(getDisplayDenomFromView(balance.value)),
      ),
    }),
    [account.balances],
  );

  const shouldRender = !!unstakedBalance || !!delegationBalances.length;

  if (!shouldRender) return null;

  return (
    <Card gradient>
      <CardHeader>
        <CardTitle>Account #{account.index.account}</CardTitle>
      </CardHeader>
      <CardContent>
        {unstakedBalance && <ValueViewComponent view={unstakedBalance.value} />}

        {!!delegationBalances.length && (
          <Table>
            <TableBody>
              {delegationBalances.map(delegationBalance => (
                <TableRow key={getDisplayDenomFromView(delegationBalance.value)}>
                  <TableCell>
                    <ValueViewComponent view={delegationBalance.value} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
