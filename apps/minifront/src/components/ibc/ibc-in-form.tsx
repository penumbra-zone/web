import { Card } from '@penumbra-zone/ui/components/ui/card';
import { SelectAccount } from '@penumbra-zone/ui/components/ui/select-account';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { getAddrByIndex } from '../../fetchers/address';
import { useChain } from '@cosmos-kit/react';
import type { BroadcastMode } from '@cosmos-kit/core';
import { ChainSelector } from './chain-selector';

export const IbcInForm = () => {
  const chainContext = useChain('osmosistestnet');
  return (
    <Card gradient className='md:p-5'>
      <h1 className='font-headline text-xl'>Enter Penumbra</h1>
      <ChainSelector />
      <div className='pb-3 md:pb-5'>
        <SelectAccount getAddrByIndex={getAddrByIndex} forceEphemeral={true} />
      </div>
      {chainContext.isWalletConnected ? (
        <Button
          className='p-4'
          onClick={() => void chainContext.sendTx(new Uint8Array(), 'block' as BroadcastMode)}
        >
          Enter
        </Button>
      ) : null}
    </Card>
  );
};
