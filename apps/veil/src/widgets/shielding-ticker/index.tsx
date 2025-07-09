'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Button } from '@penumbra-zone/ui/Button';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { useShieldingDeposits } from '@/shared/api/use-shielding-deposits';
import { useRegistry } from '@/shared/api/registry';
import { Chain, Registry } from '@penumbra-labs/registry';
import { toValueView } from '@/shared/utils/value-view';

import Image from 'next/image';
import type { ShieldingDepositWithMeta } from '@/shared/api/server/shielding-deposits';

interface DepositItemProps {
  deposit: ShieldingDepositWithMeta;
}

// Helper function to get source chain from asset metadata and foreign address
const getSourceChainFromDeposit = (
  deposit: ShieldingDepositWithMeta,
  registry: Registry,
): Chain | null => {
  // First try the metadata.base approach for IBC path format
  if (deposit.metadata?.base) {
    const parts = deposit.metadata.base.split('/');
    if (parts.length >= 2 && parts[0] === 'transfer') {
      const channelId = parts[1];
      const chainFromChannel = registry.ibcConnections.find(
        (chain: Chain) => chain.channelId === channelId,
      );
      if (chainFromChannel) {
        return chainFromChannel;
      }
    }
  }

  // Fallback: Use foreign address prefix to determine source chain
  const addressPrefix = deposit.foreignAddr.split('1')[0]; // Extract prefix before '1'

  // Temporary debugging
  if (deposit.metadata?.symbol === 'UM') {
    console.debug('🔍 Using address prefix approach for UM:');
    console.debug('foreignAddr:', deposit.foreignAddr);
    console.debug('extracted addressPrefix:', addressPrefix);
  }

  const chainFromAddress = registry.ibcConnections.find(
    (chain: Chain) => chain.addressPrefix === addressPrefix,
  );

  if (deposit.metadata?.symbol === 'UM') {
    console.debug('found chain from address:', chainFromAddress);
  }

  return chainFromAddress ?? null;
};

const DepositItem = ({ deposit }: DepositItemProps) => {
  const { data: registry } = useRegistry();

  const valueView = deposit.metadata
    ? toValueView({
        amount: Number(deposit.amount),
        metadata: deposit.metadata,
      })
    : null;

  // Get source chain information using the updated function
  const sourceChain = getSourceChainFromDeposit(deposit, registry);
  const chainIconUrl = sourceChain?.images[0]?.png ?? sourceChain?.images[0]?.svg;

  return (
    <div className='grid h-[48px] grid-cols-[2.5rem_1fr] grid-rows-2 gap-x-3 gap-y-1 rounded-sm bg-other-tonal-fill10 p-2 whitespace-nowrap backdrop-blur-lg'>
      {/* Asset icon spanning two rows - centered vertically with chain overlay */}
      <div className='relative row-span-2 flex items-center justify-center'>
        <AssetIcon metadata={deposit.metadata} size='lg' />
        {/* Source chain overlay icon */}
        {chainIconUrl && (
          <div className='absolute -right-1 -bottom-1'>
            <Image
              src={chainIconUrl}
              alt={`${sourceChain?.displayName ?? 'Chain'} icon`}
              className='h-4 w-4 rounded-full border border-other-tonal-fill10 bg-other-tonal-fill10 object-cover'
              width={16}
              height={16}
            />
          </div>
        )}
      </div>

      {/* First row: Shield + amount */}
      <div className='flex items-center gap-2'>
        <Text small color='text.primary'>
          Shield
        </Text>
        {valueView ? (
          <ValueViewComponent
            density='compact'
            valueView={valueView}
            priority='tertiary'
            signed='positive'
            abbreviate={true}
            showIcon={false}
          />
        ) : (
          <Text small color='text.secondary'>
            {deposit.amount} {deposit.metadata?.display ?? 'Unknown'}
          </Text>
        )}
      </div>

      {/* Second row: Address */}
      <Text detail color='text.secondary'>
        {deposit.foreignAddr.substring(0, 15)}...
      </Text>
    </div>
  );
};

export const ShieldingTicker = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: deposits, isLoading } = useShieldingDeposits(50);

  const hasDeposits = deposits && deposits.length > 0;

  // Auto-scroll animation
  useEffect(() => {
    if (!hasDeposits || isHovered) {
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const scroll = () => {
      // Reset to beginning when we've scrolled through the first set of items
      if (container.scrollLeft >= container.scrollWidth / 3) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += 1;
      }
    };

    const interval = setInterval(scroll, 10); // Faster scroll for smoother animation
    return () => clearInterval(interval);
  }, [hasDeposits, isHovered]);

  if (!isVisible) {
    return null;
  }

  if (isLoading || !hasDeposits) {
    return (
      <div className='w-full border-b border-other-solid-stroke'>
        <div className='container mx-auto flex max-w-[1136px] items-center justify-between px-4 py-3'>
          <div className='flex items-center gap-2'>
            <div className='h-2 w-2 animate-pulse rounded-full bg-green-400'></div>
            <Text small color='text.secondary'>
              {isLoading ? 'Loading shielding activity...' : 'No recent shielding activity'}
            </Text>
          </div>
          <Button density='compact' iconOnly icon={X} onClick={() => setIsVisible(false)}>
            Dismiss
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full border-b border-other-solid-stroke'>
      {/* Title and hide button row - constrained to container width */}
      <div className='container mx-auto flex max-w-[1136px] items-center justify-between px-4 py-3'>
        <div className='flex items-center gap-2'>
          <div className='h-2 w-2 animate-pulse rounded-full bg-green-400'></div>
          <Text small color='text.primary'>
            Live Shielding Activity
          </Text>
        </div>
        <Button density='compact' iconOnly icon={X} onClick={() => setIsVisible(false)}>
          Dismiss
        </Button>
      </div>

      {/* Full-width marquee area */}
      <div
        className='relative w-full overflow-hidden'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={scrollContainerRef}
          className='flex gap-6 overflow-x-auto py-3 [&::-webkit-scrollbar]:hidden'
          style={{
            scrollBehavior: isHovered ? 'auto' : 'smooth',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {/* Duplicate deposits multiple times for seamless scrolling */}
          {Array.from({ length: 3 }, (_, index) =>
            deposits.map(deposit => (
              <DepositItem key={`${deposit.id}-${index}`} deposit={deposit} />
            )),
          )}
        </div>
      </div>
    </div>
  );
};
