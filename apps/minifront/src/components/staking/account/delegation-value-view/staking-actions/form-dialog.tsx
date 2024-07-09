import { Button } from '@repo/ui/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@repo/ui/components/ui/dialog';
import { IdentityKeyComponent } from '@repo/ui/components/ui/identity-key-component';
import { InputBlock } from '../../../../shared/input-block';
import { Validator } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { FormEvent } from 'react';
import { getIdentityKey } from '@penumbra-zone/getters/validator';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { BalanceValueView } from '@repo/ui/components/ui/balance-value-view';
import { NumberInput } from '../../../../shared/number-input';

const getCapitalizedAction = (action: 'delegate' | 'undelegate') =>
  action.replace(/^./, firstCharacter => firstCharacter.toLocaleUpperCase());

/**
 * Renders a dialog with a form for delegating to, or undelegating from, a
 * validator.
 */
export const FormDialog = ({
  action,
  validator,
  amount,
  delegationTokens,
  stakingTokens,
  open,
  onChangeAmount,
  onClose,
  onSubmit,
}: {
  /** When defined, the dialog will be open. */
  action?: 'delegate' | 'undelegate';
  /** The validator we're delegating to or undelegating from. */
  validator: Validator;
  amount: string;
  /**
   * A `ValueView` representing the address's balance of delegation tokens. Used
   * to show the user how many tokens they have available to undelegate.
   */
  delegationTokens: ValueView;
  /**
   * A `ValueView` representing the address's balance of staking (UM) tokens.
   * Used to show the user how many tokens they have available to delegate.
   */
  stakingTokens?: ValueView;
  /**
   * Whether the form is open.
   */
  open: boolean;
  onChangeAmount: (amount: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const setInputToBalanceMax = () => {
    const type = action === 'delegate' ? stakingTokens : delegationTokens;
    if (type) {
      const formattedAmt = getFormattedAmtFromValueView(type);
      onChangeAmount(formattedAmt);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {!!open && !!action && (
          <>
            <DialogHeader>{getCapitalizedAction(action)}</DialogHeader>
            <form className='flex flex-col gap-4 overflow-hidden p-4' onSubmit={handleSubmit}>
              <div className='flex flex-col'>
                <div className='truncate'>{validator.name}</div>
                <IdentityKeyComponent identityKey={getIdentityKey(validator)} />
              </div>
              <div>
                Please verify that the identity key above is the one you expect, rather than relying
                on the validator name (as that can be spoofed).
              </div>

              {/** @todo: Refactor this block to use `InputToken` (with a new
                boolean `showSelectModal` prop) once asset balances are
                refactored as `ValueView`s. */}
              <InputBlock label={`Amount to ${action}`} className='mb-1' value={amount}>
                <NumberInput
                  variant='transparent'
                  className='mb-1 font-bold leading-10 md:h-8 md:w-[calc(100%-80px)] md:text-xl  xl:h-10 xl:w-[calc(100%-160px)] xl:text-3xl'
                  value={amount}
                  onChange={e => onChangeAmount(e.currentTarget.value)}
                  inputMode='decimal'
                  autoFocus
                />

                <div className='flex'>
                  {action === 'delegate' && stakingTokens && (
                    <BalanceValueView valueView={stakingTokens} onClick={setInputToBalanceMax} />
                  )}

                  {action === 'undelegate' && (
                    <BalanceValueView valueView={delegationTokens} onClick={setInputToBalanceMax} />
                  )}
                </div>
              </InputBlock>

              <Button type='submit' disabled={amount.length === 0}>
                {getCapitalizedAction(action)}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
