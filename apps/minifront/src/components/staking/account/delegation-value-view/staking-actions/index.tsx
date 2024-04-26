import { Button } from '@penumbra-zone/ui/components/ui/button';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { FormDialog } from './form-dialog';
import { useMemo } from 'react';
import { AllSlices } from '../../../../../state';
import { useStoreShallow } from '../../../../../utils/use-store-shallow';
import { getValidator } from '@penumbra-zone/getters/validator-info';
import { getAmount } from '@penumbra-zone/getters/value-view';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';

const stakingActionsSelector = (state: AllSlices) => ({
  action: state.staking.action,
  amount: state.staking.amount,
  delegate: state.staking.delegate,
  undelegate: state.staking.undelegate,
  onClickActionButton: state.staking.onClickActionButton,
  onClose: state.staking.onClose,
  setAmount: state.staking.setAmount,
  validatorInfo: state.staking.validatorInfo,
});

/**
 * Renders Delegate/Undelegate buttons for a validator, as well as a form inside
 * a dialog that opens when the user clicks one of those buttons.
 */
export const StakingActions = ({
  validatorInfo,
  delegationTokens,
  unstakedTokens,
}: {
  /** The validator that these actions will apply to. */
  validatorInfo: ValidatorInfo;
  /**
   * A `ValueView` representing the address's balance of delegation tokens. Used
   * to show the user how many tokens they have available to undelegate.
   */
  delegationTokens: ValueView;
  /**
   * A `ValueView` representing the address's balance of staking (UM) tokens.
   * Used to show the user how many tokens they have available to delegate.
   */
  unstakedTokens?: ValueView;
}) => {
  const state = useStoreShallow(stakingActionsSelector);
  const validator = getValidator(validatorInfo);

  const canDelegate = useMemo(
    () => (unstakedTokens ? !!joinLoHiAmount(getAmount(unstakedTokens)) : false),
    [unstakedTokens],
  );
  const canUndelegate = useMemo(
    () => !!joinLoHiAmount(getAmount(delegationTokens)),
    [delegationTokens],
  );

  const handleSubmit = () => {
    if (state.action === 'delegate') void state.delegate();
    else void state.undelegate();
  };

  return (
    <>
      <div className='flex flex-col gap-2'>
        <div className='flex gap-2'>
          <Button
            className='px-4'
            disabled={!canDelegate}
            onClick={() => state.onClickActionButton('delegate', validatorInfo)}
          >
            Delegate
          </Button>
          <Button
            variant='secondary'
            className='px-4'
            disabled={!canUndelegate}
            onClick={() => state.onClickActionButton('undelegate', validatorInfo)}
          >
            Undelegate
          </Button>
        </div>
      </div>

      <FormDialog
        action={state.action}
        open={!!state.action && validator.equals(getValidator(state.validatorInfo))}
        validator={validator}
        amount={state.amount}
        delegationTokens={delegationTokens}
        unstakedTokens={unstakedTokens}
        onChangeAmount={state.setAmount}
        onClose={state.onClose}
        onSubmit={handleSubmit}
      />
    </>
  );
};
