import { observer } from 'mobx-react-lite';
import { Button, ButtonProps } from '@penumbra-zone/ui/Button';
import dynamic from 'next/dynamic';
import { useChains } from '@cosmos-kit/react';
import { Wallet2 } from 'lucide-react';
import { Density } from '@penumbra-zone/ui/Density';
import { chainsInPenumbraRegistry } from '@/features/cosmos/chain-provider.tsx';
import { useRegistry } from '@/shared/api/registry.ts';

interface CosmosConnectButtonProps {
  actionType?: ButtonProps['actionType'];
  variant?: 'default' | 'minimal';
  children?: React.ReactNode;
}

const CosmosConnectButtonInner = observer(
  ({ actionType = 'accent', variant = 'default', children }: CosmosConnectButtonProps) => {
    const { data: registry } = useRegistry();
    const penumbraIbcChains = chainsInPenumbraRegistry(registry?.ibcConnections ?? []).map(
      c => c.chain_name,
    );
    const chains = useChains(penumbraIbcChains);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Osmosis is always available
    const { address, disconnect, openView, isWalletConnected } = (chains['osmosis'] ??
      chains['osmosistestnet'])!;

    const handleConnect = () => {
      openView();
    };

    return (
      <Density variant={variant === 'default' ? 'sparse' : 'compact'}>
        {isWalletConnected && address ? (
          <Button actionType={actionType} onClick={() => void disconnect()}>
            {`${address.slice(0, 8)}...${address.slice(-4)}`}
          </Button>
        ) : (
          <Button icon={Wallet2} actionType={actionType} onClick={handleConnect}>
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
