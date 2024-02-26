import { Card, CardContent, CardHeader, CardTitle } from '@penumbra-zone/ui';
import { BalancesByAccount } from '../../../../fetchers/balances/by-account';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { ValidatorsTable } from '../../validators-table';
import { StakingActions } from '../staking-actions';
import { useValidatorsForAccount } from './use-validators-for-account';

/**
 * Renders the user's unstaked tokens (i.e., their balance in the staking token,
 * which is available to them for staking) in the given account, along with all
 * validators that this account holds delegation/unbonding tokens for.
 */
export const Account = ({ account }: { account: BalancesByAccount }) => {
  const {
    error,
    loading,
    shouldRender,
    delegationTokensByValidatorInfo,
    unbondingTokensByValidatorInfo,
    validatorInfos,
    votingPowerByValidatorInfo,
    unstakedTokens,
  } = useValidatorsForAccount(account.balances);

  if (!shouldRender) return null;

  return (
    <Card gradient>
      <CardHeader>
        <CardTitle>Account #{account.index.account}</CardTitle>
      </CardHeader>
      <CardContent>
        {unstakedTokens && (
          <div className='flex gap-1'>
            <ValueViewComponent view={unstakedTokens} />
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
              renderStakingActions={validatorInfo => (
                <StakingActions
                  canDelegate={!!unstakedTokens}
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
