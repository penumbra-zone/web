import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { useStore } from '../../../state';
import {
  sendSelector,
  sendValidationErrors,
  useStakingTokenMetadata,
  useTransferableBalancesResponses,
} from '../../../state/send';
import { InputBlock } from '../../shared/input-block';
import { useMemo, useState } from 'react';
import { penumbraAddrValidation } from '../helpers';
import InputToken from '../../shared/input-token';
import { useRefreshFee } from './use-refresh-fee';
import { GasFee } from '../../shared/gas-fee';
import { hasStakingToken } from '../../../fetchers/staking-token';

export const SendForm = () => {
  const stakingTokenMetadata = useStakingTokenMetadata();
  const transferableBalancesResponses = useTransferableBalancesResponses();
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
  // State to manage privacy warning display
  const [showNonNativeFeeWarning, setshowNonNativeFeeWarning] = useState(false);

  // Check if the user has native staking tokens
  const stakingToken = hasStakingToken(
    transferableBalancesResponses.data,
    stakingTokenMetadata.data,
  );

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
          // Conditionally prompt a privacy warning about non-native fee tokens
          setshowNonNativeFeeWarning(Number(amount) > 0 && !stakingToken);
        }}
        validations={[
          {
            type: 'error',
            issue: 'insufficient funds',
            checkFn: () => validationErrors.amountErr,
          },
        ]}
        balances={transferableBalancesResponses.data ?? []}
      />
      {showNonNativeFeeWarning && (
        <div className='rounded border border-yellow-500 bg-gray-800 p-4 text-yellow-500'>
          <strong>Privacy Warning:</strong>
          <span className='block'>
            Using non-native tokens for transaction fees may pose a privacy risk. It is recommended
            to use the native token (UM) for better privacy and security.
          </span>
        </div>
      )}

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
