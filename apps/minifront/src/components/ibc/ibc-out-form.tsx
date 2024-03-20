import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { useStore } from '../../state';
import { InputBlock } from '../shared/input-block';
import InputToken from '../shared/input-token';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { useChain } from '@cosmos-kit/react';
import { useEffect } from 'react';
import { ChainSelector } from './chain-selector';
import {
  ibcOutDestinationSelector,
  ibcOutSelector,
  ibcOutSourceSelector,
  ibcOutValidationErrors,
} from '../../state/ibc-out';

import { cn } from '@penumbra-zone/ui/lib/utils';
import { useLoaderData } from 'react-router-dom';
import { IbcLoaderResponse } from './ibc-loader';

export const IbcOutForm = () => {
  const { defaultChainName } = useLoaderData() as IbcLoaderResponse;
  const source = useStore(ibcOutSourceSelector);
  const destination = useStore(ibcOutDestinationSelector);
  const validationErrors = useStore(ibcOutValidationErrors);
  const { filteredBalances } = useStore(ibcOutSelector);

  const chainContext = useChain(destination.chain?.chainName ?? defaultChainName);
  useEffect(() => {
    console.log('useEffect', chainContext, destination);
    const {
      isWalletConnected,
      isWalletConnecting,
      isWalletError,
      isWalletNotExist,
      isWalletDisconnected,
      isWalletRejected,
    } = chainContext;
    if (isWalletRejected || isWalletError || isWalletNotExist || isWalletDisconnected) return;
    else if (!isWalletConnected && !isWalletConnecting) void chainContext.connect();
  }, [chainContext, destination]);

  return (
    <form className='flex flex-col gap-4' onSubmit={e => e.preventDefault()}>
      <h1 className='font-headline text-xl'>Exit Penumbra</h1>
      <ChainSelector chain={destination.chain} setChainId={destination.setChain} />
      <InputToken
        label='Amount to send'
        placeholder='Enter an amount'
        className='mb-1'
        selection={new BalancesResponse(source.asset)}
        setSelection={source.setAsset}
        value={source.amount.toString()}
        onChange={e => {
          const en = BigInt(e.target.value);
          if (en > 0) source.setAmount(en);
        }}
        balances={(filteredBalances ?? []).map(b => new BalancesResponse(b))}
        validations={[
          {
            type: 'error',
            issue: 'insufficient funds',
            checkFn: () => validationErrors.amountErr,
          },
        ]}
      />
      <InputBlock
        label='Recipient on destination chain'
        className='mb-1'
        validations={[
          {
            type: 'error',
            issue: 'invalid address',
            checkFn: () => validationErrors.destErr,
          },
          {
            type: 'warn',
            issue: 'manually entered address',
            checkFn: () => validationErrors.destManual,
          },
        ]}
      >
        <Input
          className={cn(chainContext.address && !validationErrors.destManual && 'border-green-300')}
          placeholder='Enter the address'
          value={destination.address || chainContext.address}
          onChange={e => destination.setAddress(e.target.value || chainContext.address)}
        />
      </InputBlock>
      <Button disabled type='submit' variant='gradient' className='mt-9'>
        Unshield
      </Button>
    </form>
  );
};
