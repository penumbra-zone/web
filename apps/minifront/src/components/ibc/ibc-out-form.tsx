import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Card } from '@penumbra-zone/ui/components/ui/card';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { ChainSelector } from './chain-selector';
import { useLoaderData } from 'react-router-dom';
import { useStore } from '../../state';
import { filterBalancesPerChain, ibcSelector, ibcValidationErrors } from '../../state/ibc';
import InputToken from '../shared/input-token';
import { InputBlock } from '../shared/input-block';
import { IbcLoaderResponse } from './ibc-loader';

export const IbcOutForm = () => {
  const assetBalances = useLoaderData() as IbcLoaderResponse;
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
  const filteredBalances = filterBalancesPerChain(assetBalances, chain);
  const validationErrors = useStore(ibcValidationErrors);

  return (
    <Card gradient>
      <form
        className='flex flex-col gap-4'
        onSubmit={e => {
          e.preventDefault();
          void sendIbcWithdraw();
        }}
      >
        <ChainSelector light />
        <InputToken
          label='Amount to unshield'
          placeholder='Enter an amount'
          className='mb-1 bg-teal text-secondary-foreground'
          inputClassName='placeholder:text-secondary'
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
          className='mb-1 bg-teal text-secondary-foreground placeholder:text-secondary'
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
          disabled={
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            false && // testing
            (!Number(amount) ||
              !destinationChainAddress ||
              !!Object.values(validationErrors).find(Boolean) ||
              !selection)
          }
        >
          Unshield
        </Button>
      </form>
    </Card>
  );
};
