import { useStore } from '../../../state';
import { ibcInSelector } from '../../../state/ibc-in';
import { WalletStatus } from '@cosmos-kit/core';
import { WalletAddrCard } from './wallet-addr-card';
import { ConnectWalletButton } from './wallet-connect-button';
import { useChainConnector } from './hooks';

export const CosmosWalletConnector = () => {
  const { selectedChain } = useStore(ibcInSelector);
  const { username, address, status, message } = useChainConnector();

  if (!selectedChain) return <></>;

  return (
    <div className='flex flex-col items-center justify-center gap-4'>
      <div className='w-52'>
        <ConnectWalletButton />
      </div>
      {address && <WalletAddrCard username={username} address={address} />}
      {(status === WalletStatus.Rejected || status === WalletStatus.Error) && (
        <div className='text-purple-500'>{message}</div>
      )}
    </div>
  );
};
