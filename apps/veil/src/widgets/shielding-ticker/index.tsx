'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Button } from '@penumbra-zone/ui/Button';
import { useShieldingDeposits } from '@/shared/api/use-shielding-deposits';
import { useRegistry } from '@/shared/api/registry';
import { toValueView } from '@/shared/utils/value-view';
import { Chain, Registry } from '@penumbra-labs/registry';
import { bech32, bech32m } from 'bech32';
import Image from 'next/image';
import type { ShieldingDepositWithMeta } from '@/shared/api/server/shielding-deposits';

const getChainFromForeignAddress = (
  foreignAddr: string,
  registry: Registry | undefined,
): Chain | null => {
  if (!registry) {
    return null;
  }

  const decoded =
    bech32.decodeUnsafe(foreignAddr, Infinity) ?? bech32m.decodeUnsafe(foreignAddr, Infinity);
  if (!decoded?.prefix) {
    return null;
  }

  const chain = registry.ibcConnections.find(c => c.addressPrefix === decoded.prefix);
  return chain ?? null;
};

const getTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSec < 60) {
    return `${diffSec}s ago`;
  }
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  if (diffHrs < 24) {
    return `${diffHrs}h ago`;
  }
  return `${diffDays}d ago`;
};

interface DepositItemProps {
  deposit: ShieldingDepositWithMeta;
  isNew: boolean;
  isExpanded: boolean;
  onClick: () => void;
  registry: Registry | undefined;
}

const DepositItem = ({ deposit, isNew, isExpanded, onClick, registry }: DepositItemProps) => {
  const valueView = deposit.metadata
    ? toValueView({
        amount: Number(deposit.amount),
        metadata: deposit.metadata,
      })
    : null;

  const chain = getChainFromForeignAddress(deposit.foreignAddr, registry);
  const firstImage = chain?.images[0];
  const chainIconUrl = firstImage ? (firstImage.png ?? firstImage.svg) : undefined;

  return (
    <div
      onClick={onClick}
      className={`
        flex cursor-pointer justify-center items-start gap-3 rounded-lg bg-other-tonal-fill10 px-4 py-2 whitespace-nowrap
        transition-all duration-200
        ${isNew ? 'animate-pulse border border-other-tonal-stroke bg-other-tonal-fill5' : ''}
        ${isExpanded ? 'bg-other-tonal-fill5' : ''}
      `}
    >
      {/* Asset icon spanning two rows */}
      <div className='flex-shrink-0'>
        {chainIconUrl ? (
          <Image
            src={chainIconUrl}
            alt={`${chain?.displayName} chain`}
            className='h-8 w-8 rounded-full'
            width={32}
            height={32}
          />
        ) : (
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-neutral-600'>
            <Text detail>?</Text>
          </div>
        )}
      </div>

      {/* Two-row content */}
      <div className='flex flex-col'>
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

      {isExpanded && (
        <div className='ml-4 flex items-center gap-4 text-xs text-neutral-400'>
          <span>{getTimeAgo(deposit.timestamp)}</span>
          <span>Block #{deposit.height}</span>
          <span>ID: {deposit.id}</span>
        </div>
      )}
    </div>
  );
};

export const ShieldingTicker = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [lastSeenIds, setLastSeenIds] = useState<Set<number>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: deposits, isLoading } = useShieldingDeposits(50);
  const { data: registry } = useRegistry();

  const hasDeposits = deposits && deposits.length > 0;

  // Mark deposits as seen when they first appear
  useEffect(() => {
    if (deposits && deposits.length > 0) {
      const depositIds = deposits.map(d => d.id);
      // Mark as seen after a delay to allow for highlight animation
      const timer = setTimeout(() => {
        setLastSeenIds(prev => new Set([...prev, ...depositIds]));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deposits]);

  // Auto-scroll animation
  useEffect(() => {
    if (!hasDeposits || isHovered || expandedId !== null) {
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const scroll = () => {
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += 1;
      }
    };

    const interval = setInterval(scroll, 50);
    return () => clearInterval(interval);
  }, [hasDeposits, isHovered, expandedId]);

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
          <Button iconOnly icon={X} onClick={() => setIsVisible(false)}>
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
        <Button iconOnly icon={X} onClick={() => setIsVisible(false)}>
          Dismiss
        </Button>
      </div>

      {/* Full-width marquee area */}
      <div
        className='w-full overflow-hidden'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={scrollContainerRef}
          className='flex gap-6 py-3'
          style={{
            scrollBehavior: isHovered ? 'auto' : 'smooth',
          }}
        >
          {deposits.map(deposit => (
            <DepositItem
              key={deposit.id}
              deposit={deposit}
              isNew={!lastSeenIds.has(deposit.id)}
              isExpanded={expandedId === deposit.id}
              onClick={() => setExpandedId(expandedId === deposit.id ? null : deposit.id)}
              registry={registry}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
