import {
  bech32IdentityKey,
  getDisplayDenomFromView,
  getIdentityKeyFromValidatorInfo,
} from '@penumbra-zone/types';
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
import { useContext, useMemo } from 'react';
import { assetPatterns } from '@penumbra-zone/constants';
import { ValidatorInfoContext } from '../validator-info-context';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';

export const Account = ({ account }: { account: BalancesByAccount }) => {
  const { unstakedBalance, delegationBalances, unbondingBalances } = useMemo(
    () => ({
      unstakedBalance: account.balances.find(
        balance => getDisplayDenomFromView(balance.value) === 'penumbra',
      ),
      delegationBalances: account.balances.filter(balance =>
        assetPatterns.delegationTokenPattern.test(getDisplayDenomFromView(balance.value)),
      ),
      unbondingBalances: account.balances.filter(balance =>
        assetPatterns.unbondingTokenPattern.test(getDisplayDenomFromView(balance.value)),
      ),
    }),
    [account.balances],
  );

  const { validatorInfos } = useContext(ValidatorInfoContext);

  const validatorInfoByDelegation: Record<string, ValidatorInfo> = useMemo(
    () =>
      delegationBalances.reduce<Record<string, ValidatorInfo>>((prev, curr) => {
        const displayDenom = getDisplayDenomFromView(curr.value);
        const validatorInfo = validatorInfos.find(
          validatorInfo =>
            bech32IdentityKey(getIdentityKeyFromValidatorInfo(validatorInfo)) ===
            displayDenom.replace('delegation_', ''),
        );

        if (validatorInfo) prev[displayDenom] = validatorInfo;

        return prev;
      }, {}),
    [delegationBalances, validatorInfos],
  );

  const shouldRender =
    !!unstakedBalance || !!delegationBalances.length || !!unbondingBalances.length;

  if (!shouldRender) return null;

  return (
    <Card gradient>
      <CardHeader>
        <CardTitle>Account #{account.index.account}</CardTitle>
      </CardHeader>
      <CardContent>
        {unstakedBalance && (
          <div className='flex gap-1'>
            <ValueViewComponent view={unstakedBalance.value} />
            <span>available to delegate</span>
          </div>
        )}

        {!!delegationBalances.length && (
          <Table>
            <TableBody>
              {delegationBalances.map(delegationBalance => (
                <TableRow key={getDisplayDenomFromView(delegationBalance.value)}>
                  <TableCell>
                    {
                      validatorInfoByDelegation[getDisplayDenomFromView(delegationBalance.value)]
                        ?.validator?.name
                    }
                    <ValueViewComponent
                      view={delegationBalance.value}
                      showIcon={false}
                      showDenom={false}
                    />
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
