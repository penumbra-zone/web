import { Button, Card, Input } from '@penumbra-zone/ui';
import { ChainSelector } from './chain-selector';
import { useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { useStore } from '../../state';
import { ibcSelector } from '../../state/ibc';
import InputToken from '../shared/input-token';
import { InputBlock } from '../shared/input-block';
import { validateAmount } from '../../state/send';
import { IbcLoaderResponse } from './ibc-loader';

interface IbcValidationFields {
  recipientErr: boolean;
  amountErr: boolean;
}

const ibcValidationErrors = (
  asset: BalancesResponse | undefined,
  amount: string,
  recipient: string,
): IbcValidationFields => {
  return {
    recipientErr: !recipient, // TODO: validate recipient addr matches chain
    amountErr: !asset ? false : validateAmount(asset, amount),
  };
};

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
  } = useStore(ibcSelector);

  const validationErrors = useMemo(() => {
    return ibcValidationErrors(selection, amount, destinationChainAddress);
  }, [selection, amount, destinationChainAddress]);

  return (
    <Card gradient className='md:p-5'>
      <form
        className='flex flex-col gap-4'
        onSubmit={e => {
          e.preventDefault();
          void sendIbcWithdraw();
        }}
      >
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
          balances={assetBalances}
        />
        <ChainSelector />
        <InputBlock
          label='Recipient on destination chain'
          className='mb-1'
          value={destinationChainAddress}
          validations={[]}
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
          className='mt-9'
          disabled={
            !Number(amount) ||
            !destinationChainAddress ||
            !!Object.values(validationErrors).find(Boolean) ||
            !selection
          }
        >
          Send
        </Button>
      </form>
    </Card>
  );
};
