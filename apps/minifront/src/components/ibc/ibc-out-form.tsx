import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { useStore } from '../../state';
import { ibcCosmosSelector, ibcPenumbraSelector, ibcSelector } from '../../state/ibc';
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

export const IbcOutForm = () => {
  const { initialChainName } = useLoaderData() as IbcLoaderResponse;
  const [chainName, setChainName] = useState(initialChainName);
  const { penumbraChain, assetBalances } = useStore(ibcSelector);

  useEffect(() => {
    if (penumbraChain?.chainName && penumbraChain.chainName !== chainName)
      setChainName(penumbraChain.chainName);
  }, [penumbraChain, chainName, setChainName]);

  console.log('ibc-out-form', chainName);
  const chainContext = useChain(chainName);

  const { customDestination, setCustomDestination } = useStore(ibcCosmosSelector);
  const { unshield, setUnshield } = useStore(ibcPenumbraSelector);
  const { lo, hi } = unshield?.balanceView?.valueView.value?.amount ?? { lo: 0n, hi: 0n };
  const unshieldAmount = joinLoHi(lo, hi);
  const filteredBalances = filterBalancesPerChain(
    assetBalances!.map(b => new BalancesResponse(b)),
    penumbraChain,
  );

  return (
    <form className='flex flex-col gap-4' onSubmit={e => e.preventDefault()}>
      <h1 className='font-headline text-xl'>Reveal</h1>
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
      />
      <InputBlock
        label='Recipient on destination chain'
        className='mb-1'
        value={customDestination ?? chainContext.address}
      >
        <Input
          variant='transparent'
          placeholder='Enter the address'
          value={customDestination ?? chainContext.address}
          onChange={e => setCustomDestination(e.target.value)}
        />
      </InputBlock>
      <Button disabled type='submit' variant='gradient' className='mt-9'>
        Reveal
      </Button>
    </form>
  );
};
