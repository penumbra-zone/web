import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { useStore } from '../../../state';
import { sendSelector, sendValidationErrors } from '../../../state/send';
import { InputBlock } from '../../shared/input-block';
import { useMemo } from 'react';
import { penumbraAddrValidation } from '../helpers';
import InputToken from '../../shared/input-token';
import { useRefreshFee } from './use-refresh-fee';
import { GasFee } from '../../shared/gas-fee';
import { useBalancesResponses, useStakingTokenMetadata } from '../../../state/shared';
import { NonNativeFeeWarning } from '../../shared/non-native-fee-warning';
import { transferableBalancesResponsesSelector } from '../../../state/send/helpers';

export const SendForm = () => {
  const stakingTokenMetadata = useStakingTokenMetadata();
  const transferableBalancesResponses = useBalancesResponses({
    select: transferableBalancesResponsesSelector,
  });
  const {
    selection,
    amount,
    recipient,
    memo,
    fee,
    feeTier,
    setAmount,
    setSelection,
    setRecipient,
    setFeeTier,
    setMemo,
    sendTx,
    txInProgress,
  } = useStore(sendSelector);

  useRefreshFee();

  const validationErrors = useMemo(() => {
    return sendValidationErrors(selection, amount, recipient);
  }, [selection, amount, recipient]);

  return (
    <form
      className='flex flex-col gap-4 xl:gap-3'
      onSubmit={e => {
        e.preventDefault();
        void sendTx();
      }}
    >
      <InputBlock
        label='Recipient'
        className='mb-1'
        value={recipient}
        validations={[penumbraAddrValidation()]}
      >
        <Input
          variant='transparent'
          className='font-mono'
          placeholder='penumbra1…'
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
        />
      </InputBlock>
      <InputToken
        label='Amount to send'
        placeholder='Enter an amount'
        className='mb-1'
        selection={selection}
        setSelection={setSelection}
        value={amount}
        onInputChange={amount => {
          if (Number(amount) < 0) return;
          setAmount(amount);
        }}
        validations={[
          {
            type: 'error',
            issue: 'insufficient funds',
            checkFn: () => validationErrors.amountErr,
          },
        ]}
        balances={transferableBalancesResponses?.data ?? []}
      />

      <NonNativeFeeWarning
        balancesResponses={transferableBalancesResponses?.data}
        amount={Number(amount)}
      />

      <GasFee
        fee={fee}
        feeTier={feeTier}
        stakingAssetMetadata={stakingTokenMetadata.data}
        setFeeTier={setFeeTier}
      />

      <InputBlock
        label='Memo'
        value={memo}
        validations={[
          {
            type: 'error',
            issue: 'memo too long (>369 bytes)',
            checkFn: () => validationErrors.memoErr,
          },
        ]}
      >
        <Input
          variant='transparent'
          placeholder='Optional message'
          value={memo}
          onChange={e => setMemo(e.target.value)}
        />
      </InputBlock>
      <Button
        type='submit'
        variant='gradient'
        className='mt-3'
        size='lg'
        disabled={
          !Number(amount) ||
          !recipient ||
          !!Object.values(validationErrors).find(Boolean) ||
          txInProgress ||
          !selection
        }
      >
        Send
      </Button>
    </form>
  );
};
