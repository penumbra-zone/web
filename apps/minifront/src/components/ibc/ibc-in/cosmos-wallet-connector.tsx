import { useStore } from '../../../state';
import { ibcInSelector } from '../../../state/ibc-in';
import { useChain, useManager } from '@cosmos-kit/react';
import { WalletStatus } from '@cosmos-kit/core';
import { WalletAddrCard } from './wallet-addr-card';
import { ConnectWalletButton } from './wallet-connect-button';

export const useChainConnector = () => {
  const { selectedChain } = useStore(ibcInSelector);
  const { chainRecords } = useManager();
  const defaultChain = chainRecords[0]!.name;
  return useChain(selectedChain?.chainName ?? defaultChain);
};

export const CosmosWalletConnector = () => {
  const { selectedChain } = useStore(ibcInSelector);
  const { username, address, status, message } = useChainConnector();

  return (
    <div className='flex flex-col items-center justify-center gap-4'>
      {address && selectedChain && <WalletAddrCard username={username} address={address} />}
      <div className='w-52'>
        <ConnectWalletButton />
      </div>
      {(status === WalletStatus.Rejected || status === WalletStatus.Error) && (
        <div className='text-purple-500'>{message}</div>
      )}
    </div>
  );
};
