import { observer } from 'mobx-react-lite';
import { Button, ButtonProps } from '@penumbra-zone/ui/Button';
import dynamic from 'next/dynamic';
import { useChains } from '@cosmos-kit/react';
import { Wallet2 } from 'lucide-react';
import { Density } from '@penumbra-zone/ui/Density';
import { chainsInPenumbraRegistry } from '@/features/cosmos/chain-provider.tsx';
import { useRegistry } from '@/shared/api/registry.tsx';

interface CosmosConnectButtonProps {
  actionType?: ButtonProps['actionType'];
  variant?: 'default' | 'minimal';
  children?: React.ReactNode;
}

const CosmosConnectButtonInner = observer(
  ({ actionType = 'accent', variant = 'default', children }: CosmosConnectButtonProps) => {
    const { data: registry } = useRegistry();
    const penumbraIbcChains = chainsInPenumbraRegistry(registry.ibcConnections).map(
      c => c.chain_name,
    );
    const chains = useChains(penumbraIbcChains);

    const availableChain = Object.keys(chains)[0];

    const { address, disconnect, openView, isWalletConnected } = chains[availableChain ?? ''] ?? {};

    return (
      <Density variant={variant === 'default' ? 'sparse' : 'compact'}>
        {isWalletConnected && address && availableChain ? (
          <Button
            icon={Wallet2}
            aria-description={address}
            actionType={actionType}
            onClick={() => void disconnect?.()}
          >
            {`${address.slice(0, 8)}...${address.slice(-4)}`}
          </Button>
        ) : (
          <Button icon={Wallet2} actionType={actionType} onClick={() => openView?.()}>
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
