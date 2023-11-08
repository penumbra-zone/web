'use client';

import { NetworksPopover } from '@penumbra-zone/ui';
import { useChainId } from '../../hooks/chain-id.ts';

export default function Network() {
  const chainId = useChainId();

  if (!chainId) return null;

  return <NetworksPopover name={chainId} />;
}
