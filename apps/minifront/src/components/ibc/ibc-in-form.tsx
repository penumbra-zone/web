import { Button } from '@penumbra-zone/ui/components/ui/button';
import { ChainSelector } from './chain-selector';
import { useStore } from '../../state';
import { AccountSwitcher } from '@penumbra-zone/ui/components/ui/account-switcher';
import { ibcCosmosSelector, ibcPenumbraSelector, ibcSelector } from '../../state/ibc';
import { AddressComponent } from '@penumbra-zone/ui/components/ui/address-component';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { useChain } from '@cosmos-kit/react';
import { IbcLoaderResponse } from './ibc-loader';
import { useLoaderData } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { cosmos } from 'juno-network';

export const IbcInForm = () => {
  const { initialChainName } = useLoaderData() as IbcLoaderResponse;
  const [chainName, setChainName] = useState(initialChainName);
  const { penumbraChain } = useStore(ibcSelector);
  const { rpcEndpoint, setChainContext } = useStore(ibcCosmosSelector);
  const [cosmosClient, setCosmosClient] =
    useState<Awaited<ReturnType<typeof cosmos.ClientFactory.createRPCQueryClient>>>();

  const chainContext = useChain(chainName);

  const { account, setAccount, address } = useStore(ibcPenumbraSelector);

  useEffect(() => {
    if (penumbraChain?.chainName && penumbraChain.chainName !== chainName) {
      setChainName(penumbraChain.chainName);
    }
  }, [penumbraChain, chainName, setChainName]);

  useEffect(() => void setChainContext(chainContext), [chainContext, setChainContext]);

  useEffect(() => {
    void (async () => {
      if (rpcEndpoint) {
        const client = await cosmos.ClientFactory.createRPCQueryClient({ rpcEndpoint });
        setCosmosClient(client);
      }
    })();
  }, [rpcEndpoint, setCosmosClient]);

  useEffect(() => {
    void (async () => {
      const { base: denom } = chainContext.assets?.assets[0] ?? {};
      const address = chainContext.address;
      console.log('useEffect', { cosmosClient, address, denom });
      if (cosmosClient && address && denom) {
        // fetch balance
        const balance = await cosmosClient.cosmos.bank.v1beta1.balance({
          address,
          denom,
        });
        console.log('balance', balance);
      }
    })();
  }, [chainContext.address, chainContext.assets?.assets, cosmosClient]);

  void chainContext.getAccount().then(ibcAcct => {
    console.log('ibcAccount', ibcAcct);
  });

  return (
    <div className='flex flex-col gap-4'>
      <h1 className='font-headline text-xl'>Enter Penumbra</h1>
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
    </div>
  );
};
