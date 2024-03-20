import { Card } from '@penumbra-zone/ui/components/ui/card';
import { IbcInForm } from './ibc-in-form';
import { IbcOutForm } from './ibc-out-form';

import '@interchain-ui/react/styles';
import { useStore } from '../../state';
import { useChain } from '@cosmos-kit/react';
import { ibcSelector } from '../../state/ibc';
import { useLoaderData } from 'react-router-dom';
import { useEffect } from 'react';
import { Chain as PenumbraChain } from '@penumbra-zone/constants/src/chains';

export const IbcLayout = () => {
  useLoaderData();
  const { penumbraChain } = useStore(ibcSelector);

  console.log('## ibc-layout', penumbraChain?.chainName);

  return (
    penumbraChain?.chainName && (
      <ValidChainState chainName={penumbraChain.chainName}>
        <div className='flex flex-1 flex-col gap-4 md:flex-row md:place-content-around'>
          <Card className='md:self-start'>
            <IbcInForm />
          </Card>
          <Card className='md:self-end'>
            <IbcOutForm />
          </Card>
        </div>
      </ValidChainState>
    )
  );
};

const ValidChainState = ({
  chainName,
  children,
}: {
  chainName: string;
  children: React.ReactNode | React.ReactNode[];
}) => {
  const chainContext = useChain(chainName);
  useEffect(() => {
    if (!chainContext.isWalletConnected) void chainContext.connect();
  }, [chainContext.isWalletConnected, chainContext.connect, chainContext]);
  return <>{children}</>;
};
