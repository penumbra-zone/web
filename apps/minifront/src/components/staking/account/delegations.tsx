import { getIdentityKeyFromValueView } from '@penumbra-zone/getters';
import { VotingPowerAsIntegerPercentage, bech32IdentityKey } from '@penumbra-zone/types';
import { AllSlices, useStore } from '../../../state';
import { DelegationValueView } from './delegation-value-view';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { useShallow } from 'zustand/react/shallow';

const getVotingPowerAsIntegerPercentage = (
  votingPowerByValidatorInfo: Record<string, VotingPowerAsIntegerPercentage>,
  delegation: ValueView,
) => votingPowerByValidatorInfo[bech32IdentityKey(getIdentityKeyFromValueView(delegation))];

const delegationsSelector = (state: AllSlices) => ({
  delegations: state.staking.delegationsByAccount.get(state.staking.account) ?? [],
  unstakedTokens: state.staking.unstakedTokensByAccount.get(state.staking.account),
  votingPowerByValidatorInfo: state.staking.votingPowerByValidatorInfo,
});

export const Delegations = () => {
  const { delegations, unstakedTokens, votingPowerByValidatorInfo } = useStore(
    useShallow(delegationsSelector),
  );

  return (
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
  );
};
