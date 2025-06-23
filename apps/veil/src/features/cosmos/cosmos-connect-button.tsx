import { observer } from 'mobx-react-lite';
import { Button, ButtonProps } from '@penumbra-zone/ui/Button';
import dynamic from 'next/dynamic';
import { useChains } from '@cosmos-kit/react';
import { Wallet2 } from 'lucide-react';
import { Density } from '@penumbra-zone/ui/Density';
import { chainsInPenumbraRegistry } from '@/features/cosmos/chain-provider.tsx';
import { useRegistry } from '@/shared/api/registry.tsx';
import { Popover } from '@penumbra-zone/ui/Popover';
import React from 'react';

interface CosmosConnectButtonProps {
  actionType?: ButtonProps['actionType'];
  variant?: 'default' | 'minimal';
  children?: React.ReactNode;
  iconOnly?: boolean;
  noIcon?: boolean;
}

const CosmosConnectButtonInner = observer(
  ({
    actionType = 'accent',
    variant = 'default',
    children,
    iconOnly = false,
    noIcon = false,
  }: CosmosConnectButtonProps) => {
    const { data: registry } = useRegistry();
    const penumbraIbcChains = chainsInPenumbraRegistry(registry.ibcConnections).map(
      c => c.chain_name,
    );
    const chains = useChains(penumbraIbcChains);

    const availableChain = Object.keys(chains)[0];

    const { address, disconnect, openView, isWalletConnected } = chains[availableChain ?? ''] ?? {};

    const walletName = chains[availableChain ?? '']?.wallet?.prettyName;

    // Helper to truncate the address for display
    const truncatedAddress = React.useMemo(() => {
      if (!address) {
        return '';
      }
      return `${address.slice(0, 8)}...${address.slice(-4)}`;
    }, [address]);

    return (
      <Density variant={variant === 'default' ? 'sparse' : 'compact'}>
        {isWalletConnected && address && availableChain ? (
          <Popover>
            <Popover.Trigger>
              {iconOnly ? (
                <Button icon={Wallet2} actionType={actionType} iconOnly>
                  Wallet
                </Button>
              ) : (
                <Button icon={noIcon ? undefined : Wallet2} actionType={actionType}>
                  {truncatedAddress}
                </Button>
              )}
            </Popover.Trigger>
            <Popover.Content align='end' side='bottom'>
              <div className='flex flex-col items-start gap-4 text-text-primary'>
                <span className='font-semibold'>{walletName ?? 'Wallet'}</span>
                <span className='font-mono text-xs break-all text-neutral-300'>
                  {truncatedAddress}
                </span>
                <Button actionType='unshield' onClick={() => void disconnect?.()}>
                  Disconnect
                </Button>
              </div>
            </Popover.Content>
          </Popover>
        ) : (
          <Button
            icon={noIcon ? undefined : Wallet2}
            actionType={actionType}
            onClick={() => openView?.()}
          >
            {children ?? 'Connect Cosmos Wallet'}
          </Button>
        )}
      </Density>
    );
  },
);

// Export a dynamic component to prevent SSR issues with window object
export const CosmosConnectButton = dynamic(() => Promise.resolve(CosmosConnectButtonInner), {
  ssr: false,
});
