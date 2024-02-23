import { Card, CardContent, CardHeader, CardTitle } from '@penumbra-zone/ui';
import { BalancesByAccount } from '../../../../fetchers/balances/by-account';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { ValidatorsTable } from '../../validators-table';
import { StakingActions } from '.././staking-actions';
import { useValidatorsForAccount } from './use-validators-for-account';

export const Account = ({ account }: { account: BalancesByAccount }) => {
  const {
    error,
    loading,
    shouldRender,
    delegationTokensByValidatorInfo,
    unbondingTokensByValidatorInfo,
    validatorInfos,
    votingPowerByValidatorInfo,
    unstakedTokens: unstakedBalance,
  } = useValidatorsForAccount(account.balances);

  if (!shouldRender) return null;

  return (
    <Card gradient>
      <CardHeader>
        <CardTitle>Account #{account.index.account}</CardTitle>
      </CardHeader>
      <CardContent>
        {unstakedBalance && (
          <div className='flex gap-1'>
            <ValueViewComponent view={unstakedBalance} />
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
                  delegationTokens={delegationTokensByValidatorInfo.get(validatorInfo)}
                  unbondingTokens={unbondingTokensByValidatorInfo.get(validatorInfo)}
                />
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
