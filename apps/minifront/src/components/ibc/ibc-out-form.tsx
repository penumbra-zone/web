import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { useStore } from '../../state';
import {
  ibcCosmosSelector,
  ibcPenumbraSelector,
  ibcSelector,
  ibcValidationErrors,
} from '../../state/ibc';
import { InputBlock } from '../shared/input-block';
import InputToken from '../shared/input-token';
import { joinLoHi, splitLoHi } from '@penumbra-zone/types/src/lo-hi';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { filterBalancesPerChain } from '../../state/filter-balances-per-chain';
import { useLoaderData } from 'react-router-dom';
import { useChain } from '@cosmos-kit/react';
import { IbcLoaderResponse } from './ibc-loader';
import { useEffect, useState } from 'react';
import { ChainSelector } from './chain-selector';

import { cn } from '@penumbra-zone/ui/lib/utils';

export const IbcOutForm = () => {
  const { initialChainName } = useLoaderData() as IbcLoaderResponse;
  const [chainName, setChainName] = useState(initialChainName);
  const validationErrors = useStore(ibcValidationErrors);
  const { penumbraChain, assetBalances } = useStore(ibcSelector);

  const { destination, setDestination } = useStore(ibcCosmosSelector);
  const [inputDestination, setInputDestination] = useState<string | undefined>();

  console.log('ibc-out-form', chainName);
  const chainContext = useChain(chainName);

  const { unshield, setUnshield } = useStore(ibcPenumbraSelector);
  const { lo, hi } = unshield?.balanceView?.valueView.value?.amount ?? { lo: 0n, hi: 0n };
  const unshieldAmount = joinLoHi(lo, hi);
  const filteredBalances = filterBalancesPerChain(
    assetBalances!.map(b => new BalancesResponse(b)),
    penumbraChain,
  );

  useEffect(() => {
    if (penumbraChain?.chainName && penumbraChain.chainName !== chainName) {
      setInputDestination(undefined);
      setChainName(penumbraChain.chainName);
    }
  }, [penumbraChain, chainName, setChainName, setInputDestination]);

  useEffect(() => {
    setDestination(inputDestination ?? chainContext.address);
  }, [chainContext.address, inputDestination, setDestination]);

  const manualDestination = inputDestination !== chainContext.address;

  return (
    <form className='flex flex-col gap-4' onSubmit={e => e.preventDefault()}>
      <h1 className='font-headline text-xl'>Exit Penumbra</h1>
      <ChainSelector />
      <InputToken
        label='Amount to send'
        placeholder='Enter an amount'
        className='mb-1'
        selection={new BalancesResponse(unshield)}
        setSelection={setUnshield}
        value={unshieldAmount.toString()}
        onChange={e => {
          if (Number(e.target.value) < 0) return;
          const newUnshield = new BalancesResponse(unshield);
          newUnshield.balanceView!.valueView.value!.amount = new Amount(
            splitLoHi(BigInt(e.target.value)),
          );
          setUnshield(newUnshield);
        }}
        balances={filteredBalances}
        validations={[
          {
            type: 'error',
            issue: 'insufficient funds',
            checkFn: () => validationErrors.unshieldAmountErr,
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
            checkFn: () => validationErrors.destinationErr,
          },
          {
            type: 'warn',
            issue: 'manually entered address',
            checkFn: () => manualDestination,
          },
        ]}
      >
        <Input
          className={cn(!manualDestination && 'border-green-300')}
          placeholder='Enter the address'
          value={destination}
          onChange={e => setInputDestination(e.target.value || chainContext.address)}
        />
      </InputBlock>
      <Button disabled type='submit' variant='gradient' className='mt-9'>
        Reveal
      </Button>
    </form>
  );
};
