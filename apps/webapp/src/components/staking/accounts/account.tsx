import {
  bech32IdentityKey,
  getDisplayDenomFromView,
  getIdentityKeyFromValidatorInfo,
} from '@penumbra-zone/types';
import { Card, CardContent, CardHeader, CardTitle } from '@penumbra-zone/ui';
import { BalancesByAccount } from '../../../fetchers/balances/by-account';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { useContext, useMemo } from 'react';
import { STAKING_TOKEN, assetPatterns } from '@penumbra-zone/constants';
import { ValidatorInfoContext } from '../validator-info-context';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValidatorsTable } from '../validators-table';
import { AssetBalance } from '../../../fetchers/balances';
import { StakingActions } from './staking-actions';
import { getBech32IdentityKeyFromValueView } from './helpers';

const hasDelegationOrUnbondingTokens =
  (delegationBalances: AssetBalance[], unbondingBalances: AssetBalance[]) =>
  (validatorInfo: ValidatorInfo): boolean => {
    const identityKey = bech32IdentityKey(getIdentityKeyFromValidatorInfo(validatorInfo));
    const hasDelegationTokens = delegationBalances.some(
      ({ value }) => getBech32IdentityKeyFromValueView(value) === identityKey,
    );
    const hasUnbondingTokens = unbondingBalances.some(
      ({ value }) => getBech32IdentityKeyFromValueView(value) === identityKey,
    );

    return hasDelegationTokens || hasUnbondingTokens;
  };

export const Account = ({ account }: { account: BalancesByAccount }) => {
  const { unstakedBalance, delegationBalances, unbondingBalances } = useMemo(
    () => ({
      unstakedBalance: account.balances.find(
        balance => getDisplayDenomFromView(balance.value) === STAKING_TOKEN,
      ),
      delegationBalances: account.balances.filter(balance =>
        assetPatterns.delegationToken.test(getDisplayDenomFromView(balance.value)),
      ),
      unbondingBalances: account.balances.filter(balance =>
        assetPatterns.unbondingToken.test(getDisplayDenomFromView(balance.value)),
      ),
    }),
    [account.balances],
  );

  const {
    validatorInfos: unfilteredValidatorInfos,
    votingPowerByValidatorInfo,
    loading,
    error,
  } = useContext(ValidatorInfoContext);

  const validatorInfos = unfilteredValidatorInfos.filter(
    hasDelegationOrUnbondingTokens(delegationBalances, unbondingBalances),
  );

  const tokensByValidatorInfo: Map<
    ValidatorInfo,
    { delegation?: ValueView; unbonding?: ValueView }
  > = validatorInfos.reduce((prev, curr) => {
    const validatorIdentityKey = bech32IdentityKey(getIdentityKeyFromValidatorInfo(curr));

    const tokens = {
      delegation: delegationBalances.find(
        balance => getBech32IdentityKeyFromValueView(balance.value) === validatorIdentityKey,
      )?.value,
      unbonding: unbondingBalances.find(
        balance => getBech32IdentityKeyFromValueView(balance.value) === validatorIdentityKey,
      )?.value,
    };
    prev.set(curr, tokens);

    return prev;
  }, new Map<ValidatorInfo, { delegation?: ValueView; unbonding?: ValueView }>());

  const shouldRender = !!unstakedBalance || !!validatorInfos.length;

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

        {!!validatorInfos.length && (
          <div className='mt-8'>
            <ValidatorsTable
              validatorInfos={validatorInfos}
              votingPowerByValidatorInfo={votingPowerByValidatorInfo}
              loading={loading}
              error={error}
              renderStaking={validatorInfo => (
                <StakingActions
                  canDelegate={!!unstakedBalance}
                  delegationTokens={tokensByValidatorInfo.get(validatorInfo)?.delegation}
                  unbondingTokens={tokensByValidatorInfo.get(validatorInfo)?.unbonding}
                />
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
