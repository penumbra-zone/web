import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { ChainSelector } from './chain-selector';
import { useLoaderData } from 'react-router-dom';
import { useStore } from '../../../state';
import { filterBalancesPerChain, ibcSelector, ibcValidationErrors } from '../../../state/ibc';
import InputToken from '../../shared/input-token';
import { InputBlock } from '../../shared/input-block';
import { IbcLoaderResponse } from '../ibc-loader';
import { LockOpen2Icon } from '@radix-ui/react-icons';

export const IbcOutForm = () => {
  const { balances, stakingTokenMetadata, assets } = useLoaderData() as IbcLoaderResponse;
  const {
    sendIbcWithdraw,
    destinationChainAddress,
    setDestinationChainAddress,
    amount,
    setAmount,
    selection,
    setSelection,
    chain,
  } = useStore(ibcSelector);
  const filteredBalances = filterBalancesPerChain(balances, chain, stakingTokenMetadata, assets);
  const validationErrors = useStore(ibcValidationErrors);

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
        placeholder='Enter an amount'
        className='mb-1'
        selection={selection}
        setSelection={setSelection}
        value={amount}
        onChange={e => {
          if (Number(e.target.value) < 0) return;
          setAmount(e.target.value);
        }}
        validations={[
          {
            type: 'error',
            issue: 'insufficient funds',
            checkFn: () => validationErrors.amountErr,
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
