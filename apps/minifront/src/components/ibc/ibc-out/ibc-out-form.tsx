import { Button } from '@penumbra-zone/ui-old/components/ui/button';
import { Input } from '@penumbra-zone/ui-old/components/ui/input';
import { ChainSelector } from './chain-selector';
import { useStore } from '../../../state';
import {
  filteredIbcBalancesSelector,
  ibcOutSelector,
  ibcPlaceholderSelector,
  ibcValidationErrors,
} from '../../../state/ibc-out';
import InputToken from '../../shared/input-token';
import { InputBlock } from '../../shared/input-block';
import { LockOpen2Icon } from '@radix-ui/react-icons';
import { useAssets, useBalancesResponses, useStakingTokenMetadata } from '../../../state/shared';

const useFilteredBalances = () => {
  // Kick off requests
  useStakingTokenMetadata();
  useAssets();
  useBalancesResponses();
  // ========================
  return useStore(filteredIbcBalancesSelector);
};

export const IbcOutForm = () => {
  const filteredBalances = useFilteredBalances();

  const {
    sendIbcWithdraw,
    destinationChainAddress,
    setDestinationChainAddress,
    amount,
    setAmount,
    selection,
    setSelection,
  } = useStore(ibcOutSelector);
  const validationErrors = useStore(ibcValidationErrors);
  const placeholder = useStore(ibcPlaceholderSelector);

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={e => {
        e.preventDefault();
        void sendIbcWithdraw();
      }}
    >
      <ChainSelector />
      <InputToken
        label='Amount to send'
        placeholder={placeholder}
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
        balances={filteredBalances}
      />
      <InputBlock
        label='Recipient on destination chain'
        className='mb-1'
        value={destinationChainAddress}
        validations={[
          {
            type: 'error',
            issue: 'address not valid',
            checkFn: () => validationErrors.recipientErr,
          },
        ]}
      >
        <Input
          variant='transparent'
          placeholder='Enter the address'
          value={destinationChainAddress}
          onChange={e => setDestinationChainAddress(e.target.value)}
        />
      </InputBlock>
      <Button
        type='submit'
        variant='gradient'
        disabled={
          !Number(amount) ||
          !destinationChainAddress ||
          !!Object.values(validationErrors).find(Boolean) ||
          !selection
        }
        className='flex items-center gap-2'
      >
        <LockOpen2Icon />
        <span className='-mb-1'>Unshield Assets</span>
      </Button>
    </form>
  );
};
