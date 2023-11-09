import { NetworksPopover } from '@penumbra-zone/ui';
import { useChainId } from '../../fetchers/chain-id.ts';

export default function Network() {
  const chainId = useChainId();

  if (!chainId) return null;

  return <NetworksPopover name={chainId} />;
}
