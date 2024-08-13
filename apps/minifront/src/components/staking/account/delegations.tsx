import { AnimatePresence, motion } from 'framer-motion';
import { AllSlices } from '../../../state';
import { DelegationValueView } from './delegation-value-view';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { getValidatorIdentityKeyFromValueView } from '@penumbra-zone/getters/value-view';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import { VotingPowerAsIntegerPercentage } from '@penumbra-zone/types/staking';

const getVotingPowerAsIntegerPercentage = (
  votingPowerByValidatorInfo: Record<string, VotingPowerAsIntegerPercentage>,
  delegation: ValueView,
) =>
  votingPowerByValidatorInfo[bech32mIdentityKey(getValidatorIdentityKeyFromValueView(delegation))];

const delegationsSelector = (state: AllSlices) => ({
  delegations: state.staking.delegationsByAccount.get(state.staking.account) ?? [],
  votingPowerByValidatorInfo: state.staking.votingPowerByValidatorInfo,
});

export const Delegations = () => {
  const { delegations, votingPowerByValidatorInfo } = useStoreShallow(delegationsSelector);

  return (
    <div className='mt-8 flex flex-col gap-8'>
      <AnimatePresence>
        {delegations.map(delegation => (
          <motion.div
            key={bech32mIdentityKey(getValidatorIdentityKeyFromValueView(delegation))}
            layout
            className='bg-charcoal'
          >
            <DelegationValueView
              valueView={delegation}
              votingPowerAsIntegerPercentage={getVotingPowerAsIntegerPercentage(
                votingPowerByValidatorInfo,
                delegation,
              )}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
