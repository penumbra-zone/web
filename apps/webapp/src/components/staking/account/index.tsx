import { VotingPowerAsIntegerPercentage, bech32IdentityKey } from '@penumbra-zone/types';
import { getIdentityKeyFromValueView } from '@penumbra-zone/getters';
import { useStore } from '../../../state';
import { stakingSelector } from '../../../state/staking';
import { DelegationValueView } from './delegation-value-view';
import { Card, CardContent, CardHeader, CardTitle } from '@penumbra-zone/ui';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Header } from './header';

const getVotingPowerAsIntegerPercentage = (
  votingPowerByValidatorInfo: Record<string, VotingPowerAsIntegerPercentage>,
  delegation: ValueView,
) => votingPowerByValidatorInfo[bech32IdentityKey(getIdentityKeyFromValueView(delegation))];

export const Account = () => {
  const { account, delegationsByAccount, unstakedTokensByAccount, votingPowerByValidatorInfo } =
    useStore(stakingSelector);
  const unstakedTokens = unstakedTokensByAccount.get(account);
  const delegations = delegationsByAccount.get(account) ?? [];

  return (
    <div className='flex flex-col gap-4'>
      <Header />

      {!!delegations.length && (
        <Card>
          <CardHeader>
            <CardTitle>Delegation tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='mt-8 flex flex-col gap-8'>
              {delegations.map(delegation => (
                <DelegationValueView
                  key={bech32IdentityKey(getIdentityKeyFromValueView(delegation))}
                  valueView={delegation}
                  unstakedTokens={unstakedTokens}
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
