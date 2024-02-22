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

export const Account = ({ account }: { account: BalancesByAccount }) => {
  const unstakedBalance = useMemo(
    () => account.balances.find(balance => getDisplayDenomFromView(balance.value) === 'penumbra'),
    [account.balances],
  );

  if (!unstakedBalance) return null;

  return (
    <Card gradient>
      <CardHeader>
        <CardTitle>Account #{account.index.account}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <ValueViewComponent view={unstakedBalance.value} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
