import { WalletStatus } from 'cosmos-kit';
import { WalletIcon } from '@repo/ui/components/ui/icons/wallet';
import { MouseEventHandler } from 'react';
import { useStore } from '../../../state';
import { ibcInSelector } from '../../../state/ibc-in';

import { useChainConnector } from './hooks';
import { cn } from '@repo/ui/lib/utils';

export const ConnectWalletButton = () => {
  const { connect, openView, status } = useChainConnector();
  const { selectedChain } = useStore(ibcInSelector);

  if (!selectedChain) {
    return <WalletButtonBase buttonText='Connect Wallet' isDisabled={true} />;
  }

  const onClickConnect: MouseEventHandler = e => {
    e.preventDefault();
    void connect();
  };

  const onClickOpenView: MouseEventHandler = e => {
    e.preventDefault();
    openView();
  };

  switch (status) {
    case WalletStatus.Disconnected:
      return <WalletButtonBase buttonText='Connect Wallet' onClick={onClickConnect} />;
    case WalletStatus.Connecting:
      return <WalletButtonBase isLoading={true} />;
    case WalletStatus.Connected:
      return <WalletButtonBase buttonText='My Wallet' onClick={onClickOpenView} />;
    case WalletStatus.Rejected:
      return <WalletButtonBase buttonText='Reconnect' onClick={onClickConnect} />;
    case WalletStatus.Error:
      return <WalletButtonBase buttonText='Change Wallet' onClick={onClickOpenView} />;
    case WalletStatus.NotExist:
      return <WalletButtonBase buttonText='Install Wallet' onClick={onClickOpenView} />;
    default:
      return <WalletButtonBase buttonText='Connect Wallet' onClick={onClickConnect} />;
  }
};

interface BaseProps {
  buttonText?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const WalletButtonBase = ({ buttonText, isLoading, isDisabled, onClick }: BaseProps) => {
  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        'relative',
        isDisabled && 'hover:cursor-not-allowed',
        isLoading && 'hover:cursor-wait',
      )}
    >
      <div
        className={cn(
          'absolute inset-0 z-0 -m-px rounded-lg bg-gradient-to-r',
          'from-[rgba(157,75,199,1)] via-[rgba(138,78,201.5,1)] to-[rgba(119,81,204,1)]',
          isDisabled &&
            'from-[rgba(157,75,199,0.7)] via-[rgba(138,78,201,0.7)] to-[rgba(119,81,204,0.7)]',
        )}
      />
      <div className='relative z-10 flex items-center justify-center gap-1 rounded p-2'>
        <WalletIcon />
        <span className='font-bold'>{buttonText ? buttonText : 'Connect Wallet'}</span>
      </div>
    </button>
  );
};
