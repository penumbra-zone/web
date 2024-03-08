import { Button } from '@penumbra-zone/ui';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { getAmount, getValidator } from '@penumbra-zone/getters';
import { joinLoHiAmount } from '@penumbra-zone/types';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { FormDialog } from './form-dialog';
import { useMemo } from 'react';
import { useStore } from '../../../../../state';

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
  const action = useStore(state => state.staking.action);
  const amount = useStore(state => state.staking.amount);
  const onClickActionButton = useStore(state => state.staking.onClickActionButton);
  const delegate = useStore(state => state.staking.delegate);
  const undelegate = useStore(state => state.staking.undelegate);
  const onClose = useStore(state => state.staking.onClose);
  const setAmount = useStore(state => state.staking.setAmount);
  const selectedValidatorInfo = useStore(state => state.staking.validatorInfo);
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
    if (action === 'delegate') void delegate();
    else void undelegate();
  };

  return (
    <>
      <div className='flex flex-col gap-2'>
        <div className='flex gap-2'>
          <Button
            className='px-4'
            disabled={!canDelegate}
            onClick={() => onClickActionButton('delegate', validatorInfo)}
          >
            Delegate
          </Button>
          <Button
            variant='secondary'
            className='px-4'
            disabled={!canUndelegate}
            onClick={() => onClickActionButton('undelegate', validatorInfo)}
          >
            Undelegate
          </Button>
        </div>
      </div>

      <FormDialog
        action={action}
        open={!!action && validator.equals(getValidator(selectedValidatorInfo))}
        validator={validator}
        amount={amount}
        delegationTokens={delegationTokens}
        unstakedTokens={unstakedTokens}
        onChangeAmount={setAmount}
        onClose={onClose}
        onSubmit={handleSubmit}
      />
    </>
  );
};
