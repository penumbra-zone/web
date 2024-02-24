import { Card, CardContent } from '@penumbra-zone/ui';
import { BalancesByAccount } from '../../../../fetchers/balances/by-account';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { useValidatorsForAccount } from './use-validators-for-account';
import { DelegationValueView } from './delegation-value-view';
import { getValidator } from '@penumbra-zone/types';

/**
 * Renders the user's unstaked tokens (i.e., their balance in the staking token,
 * which is available to them for staking) in the given account, along with all
 * validators that this account holds delegation/unbonding tokens for.
 */
export const Account = ({ account }: { account: BalancesByAccount }) => {
  const {
    shouldRender,
    delegationTokensByValidatorInfo,
    validatorInfos,
    votingPowerByValidatorInfo,
    unstakedTokens,
  } = useValidatorsForAccount(account.balances);

  if (!shouldRender) return null;

  return (
    <Card gradient>
      <CardContent>
        {unstakedTokens && (
          <div className='flex gap-1'>
            <ValueViewComponent view={unstakedTokens} />
            <span>available to delegate</span>
          </div>
        )}

        {!!validatorInfos.length && (
          <div className='mt-8 flex flex-col gap-8'>
            {validatorInfos.map(validatorInfo => (
              <DelegationValueView
                key={getValidator(validatorInfo).name}
                validatorInfo={validatorInfo}
                votingPowerAsIntegerPercentage={votingPowerByValidatorInfo.get(validatorInfo)}
                valueView={delegationTokensByValidatorInfo.get(validatorInfo)}
                canDelegate={!!unstakedTokens}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
