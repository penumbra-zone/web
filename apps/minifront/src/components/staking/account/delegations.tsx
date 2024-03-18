import { AllSlices } from '../../../state';
import { DelegationValueView } from './delegation-value-view';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { getIdentityKeyFromValueView } from '@penumbra-zone/getters/src/value-view';
import { bech32IdentityKey } from '@penumbra-zone/bech32/src/identity-key';
import { VotingPowerAsIntegerPercentage } from '@penumbra-zone/types/src/staking';

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
  const { delegations, unstakedTokens, votingPowerByValidatorInfo } =
    useStoreShallow(delegationsSelector);

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
