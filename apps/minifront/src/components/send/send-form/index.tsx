import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { useStore } from '../../../state';
import { sendSelector, sendValidationErrors } from '../../../state/send';
import { InputBlock } from '../../shared/input-block';
import { useEffect, useMemo } from 'react';
import { penumbraAddrValidation } from '../helpers';
import InputToken from '../../shared/input-token';
import { GasFee } from '../../shared/gas-fee';
import { useBalancesResponses, useGasPrices, useStakingTokenMetadata } from '../../../state/shared';
import { NonNativeFeeWarning } from '../../shared/non-native-fee-warning';
import { transferableBalancesResponsesSelector } from '../../../state/send/helpers';
import { useRefreshFee } from '../../v2/transfer-layout/send-page/use-refresh-fee';
import { hasStakingToken } from '../../../fetchers/gas-prices';

export const SendForm = () => {
  // Retrieve the staking token metadata and gas prices from the zustand
  const stakingTokenMetadata = useStakingTokenMetadata();
  const gasPrices = useGasPrices();
  
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
    setGasPrices,
    setStakingToken,
    txInProgress,
  } = useStore(sendSelector);

  useRefreshFee();

  // Determine if the selected token is the staking token based on the current balances and metadata
  const isStakingToken = hasStakingToken(
    transferableBalancesResponses?.data,
    stakingTokenMetadata.data,
    selection,
  );

  // useEffect here defers the state updates until after the rendering phase is complete,
  // preventing direct state modifications during rendering.
  useEffect(() => {
    const updateStakingTokenAndGasPrices = () => {
      // Update the zustand store and local state
      setStakingToken(isStakingToken);
      if (gasPrices.data) {
        setGasPrices(gasPrices.data);
      }
    };

    updateStakingTokenAndGasPrices();
  }, [
    transferableBalancesResponses,
    stakingTokenMetadata,
    selection,
    gasPrices,
    isStakingToken,
    setGasPrices,
    setStakingToken,
  ]);

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

      <NonNativeFeeWarning amount={Number(amount)} hasStakingToken={isStakingToken} />

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
