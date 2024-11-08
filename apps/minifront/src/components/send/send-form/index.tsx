import { Button } from '@penumbra-zone/ui-old/components/ui/button';
import { Input } from '@penumbra-zone/ui-old/components/ui/input';
import { useStore } from '../../../state';
import { sendSelector, sendValidationErrors } from '../../../state/send';
import { InputBlock } from '../../shared/input-block';
import { useMemo } from 'react';
import { penumbraAddrValidation } from '../helpers';
import InputToken from '../../shared/input-token';
import { GasFee } from '../../shared/gas-fee';
import { useBalancesResponses, useStakingTokenMetadata } from '../../../state/shared';
import { NonNativeFeeWarning } from '../../shared/non-native-fee-warning';
import { transferableBalancesResponsesSelector } from '../../../state/send/helpers';
import { useRefreshFee } from '../../v2/transfer-layout/send-page/use-refresh-fee';

export const SendForm = () => {
  // Retrieve the staking token metadata and gas prices from the zustand
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
    assetFeeMetadata,
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
          if (Number(amount) < 0) {
            return;
          }
          setAmount(amount);
        }}
        validations={[
          {
            type: 'error',
            issue: 'insufficient funds',
            checkFn: () => validationErrors.amountErr,
          },
          {
            type: 'error',
            issue: 'invalid decimal length',
            checkFn: () => validationErrors.exponentErr,
          },
        ]}
        balances={transferableBalancesResponses?.data ?? []}
        loading={transferableBalancesResponses?.loading}
      />

      <NonNativeFeeWarning
        balancesResponses={transferableBalancesResponses?.data}
        amount={Number(amount)}
        source={selection}
      />

      <GasFee
        fee={fee}
        feeTier={feeTier}
        stakingAssetMetadata={stakingTokenMetadata.data}
        setFeeTier={setFeeTier}
        assetFeeMetadata={assetFeeMetadata}
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
