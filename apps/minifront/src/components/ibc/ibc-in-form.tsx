import { Button } from '@penumbra-zone/ui/components/ui/button';
import { ChainSelector } from './chain-selector';
import { useStore } from '../../state';
import { AccountSwitcher } from '@penumbra-zone/ui/components/ui/account-switcher';
import { ibcPenumbraSelector, ibcSelector } from '../../state/ibc';
import { AddressComponent } from '@penumbra-zone/ui/components/ui/address-component';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { useChain } from '@cosmos-kit/react';
import { IbcLoaderResponse } from './ibc-loader';
import { useLoaderData } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const IbcInForm = () => {
  const { initialChainName } = useLoaderData() as IbcLoaderResponse;
  const [chainName, setChainName] = useState(initialChainName);
  const { penumbraChain } = useStore(ibcSelector);

  useEffect(() => {
    if (penumbraChain?.chainName && penumbraChain.chainName !== chainName)
      setChainName(penumbraChain.chainName);
  }, [penumbraChain, chainName, setChainName]);

  console.log('ibc-in-form', chainName);
  const chainContext = useChain(chainName);

  const { account, setAccount, address } = useStore(ibcPenumbraSelector);

  return (
    <>
      <h1 className='font-headline text-xl'>Occlude</h1>
      <ChainSelector />
      <div className='pb-3 md:pb-5'>
        <AccountSwitcher account={account} onChange={acct => void setAccount(acct)} />
        <AddressComponent address={new Address(address)} ephemeral={true} />
      </div>
      {chainContext.isWalletConnected && (
        <Button className='p-4' onClick={() => void 0}>
          Occlude
        </Button>
      )}
    </>
  );
};
