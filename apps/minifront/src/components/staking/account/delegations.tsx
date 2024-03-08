import { getIdentityKeyFromValueView } from '@penumbra-zone/getters';
import { VotingPowerAsIntegerPercentage, bech32IdentityKey } from '@penumbra-zone/types';
import { useStore } from '../../../state';
import { stakingSelector } from '../../../state/staking';
import { DelegationValueView } from './delegation-value-view';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

const getVotingPowerAsIntegerPercentage = (
  votingPowerByValidatorInfo: Record<string, VotingPowerAsIntegerPercentage>,
  delegation: ValueView,
) => votingPowerByValidatorInfo[bech32IdentityKey(getIdentityKeyFromValueView(delegation))];

export const Delegations = () => {
  const {
    account,
    delegationsByAccount,
    unstakedTokensByAccount,
    votingPowerByValidatorInfo,

    action,
    amount,
    delegate,
    loading,
    onClickActionButton,
    onClose,
    setAmount,
    undelegate,
    validatorInfo,
  } = useStore(stakingSelector);
  const unstakedTokens = unstakedTokensByAccount.get(account);
  const delegations = delegationsByAccount.get(account) ?? [];

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
          amount={amount}
          delegate={delegate}
          onClickActionButton={onClickActionButton}
          onClose={onClose}
          setAmount={setAmount}
          undelegate={undelegate}
          action={action}
          validatorInfo={validatorInfo}
          loading={loading}
        />
      ))}
    </div>
  );
};
