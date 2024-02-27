import {
  VotingPowerAsIntegerPercentage,
  bech32IdentityKey,
  getDisplayDenomFromView,
  getIdentityKeyFromValidatorInfo,
  getValidatorInfoFromValueView,
} from '@penumbra-zone/types';
import { useStore } from '../../../state';
import { stakingSelector } from '../../../state/staking';
import { DelegationValueView } from './delegation-value-view';
import { Card, CardContent, CardHeader, CardTitle } from '@penumbra-zone/ui';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';

const getVotingPowerAsIntegerPercentage = (
  votingPowerByValidatorInfo: Record<string, VotingPowerAsIntegerPercentage>,
  delegation: ValueView,
) =>
  votingPowerByValidatorInfo[
    bech32IdentityKey(getIdentityKeyFromValidatorInfo(getValidatorInfoFromValueView(delegation)))
  ];

export const Account = () => {
  const { account, delegationsByAccount, unstakedTokensByAccount, votingPowerByValidatorInfo } =
    useStore(stakingSelector);
  const unstakedTokens = unstakedTokensByAccount.get(account);
  const delegations = delegationsByAccount.get(account) ?? [];

  return (
    <div className='flex flex-col gap-4'>
      {!!unstakedTokens && (
        <Card gradient>
          <CardContent>
            <div className='flex gap-1'>
              <ValueViewComponent view={unstakedTokens} />
              <span>available to delegate</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!!delegations.length && (
        <Card>
          <CardHeader>
            <CardTitle>Delegation tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='mt-8 flex flex-col gap-8'>
              {delegations.map(delegation => (
                <DelegationValueView
                  key={getDisplayDenomFromView(delegation)}
                  canDelegate={!!unstakedTokens}
                  valueView={delegation}
                  votingPowerAsIntegerPercentage={getVotingPowerAsIntegerPercentage(
                    votingPowerByValidatorInfo,
                    delegation,
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
