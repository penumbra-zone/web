import { Button } from '@penumbra-zone/ui';
import { useStore } from '../../../../../state';
import { stakingSelector } from '../../../../../state/staking';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { getAmount, getValidator, joinLoHiAmount } from '@penumbra-zone/types';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { FormDialog } from './form-dialog';
import { useMemo } from 'react';

/**
 * Renders Delegate/Undelegate buttons for a validator.
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
  const handleClickUndelegate = () => alert('Not yet implemented; coming soon!');

  const { action, amount, onSubmit, onClickActionButton, onClose, setAmount } =
    useStore(stakingSelector);

  const validator = getValidator(validatorInfo);

  const canDelegate = useMemo(
    () => (unstakedTokens ? !!joinLoHiAmount(getAmount(unstakedTokens)) : false),
    [unstakedTokens],
  );
  const canUndelegate = useMemo(
    () => !!joinLoHiAmount(getAmount(delegationTokens)),
    [delegationTokens],
  );

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
            onClick={handleClickUndelegate}
          >
            Undelegate
          </Button>
        </div>
      </div>

      <FormDialog
        action={action}
        validator={validator}
        amount={amount}
        delegationTokens={delegationTokens}
        unstakedTokens={unstakedTokens}
        onChangeAmount={setAmount}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </>
  );
};
