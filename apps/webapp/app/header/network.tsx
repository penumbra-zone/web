'use client';

import { NetworksPopover } from '@penumbra-zone/ui';
import { useChainId } from '../../hooks/chain-id';

export default function Network() {
  const chainId = useChainId();

  return <>{chainId && <NetworksPopover name={chainId} triggerClassName='px-4' />}</>;
}
