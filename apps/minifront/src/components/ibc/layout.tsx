import { Card } from '@penumbra-zone/ui/components/ui/card';
import { IbcInForm } from './ibc-in-form';
import { IbcOutForm } from './ibc-out-form';

import '@interchain-ui/react/styles';
import { useStore } from '../../state';
import { useChain } from '@cosmos-kit/react';
import { ibcSelector } from '../../state/ibc';
import { useLoaderData } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IbcLoaderResponse } from './ibc-loader';

export const IbcLayout = () => {
  const { initialChainName } = useLoaderData() as IbcLoaderResponse;
  const [chainName, setChainName] = useState(initialChainName);
  const { penumbraChain } = useStore(ibcSelector);

  useEffect(() => {
    if (penumbraChain?.chainName && penumbraChain.chainName !== chainName)
      setChainName(penumbraChain.chainName);
  }, [penumbraChain, chainName, setChainName]);

  const chainContext = useChain(chainName);

  useEffect(() => {
    if (!chainContext.isWalletConnected) void chainContext.connect();
  }, [chainContext.isWalletConnected, chainContext.connect, chainContext]);

  return (
    <>
      <div className='flex flex-1 flex-col gap-4 md:flex-row md:place-content-around'>
        <Card className='md:self-start'>
          <IbcInForm />
        </Card>
        <Card className='md:self-end'>
          <IbcOutForm />
        </Card>
      </div>
    </>
  );
};
