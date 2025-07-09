'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Button } from '@penumbra-zone/ui/Button';
import { useShieldingDeposits } from '@/shared/api/use-shielding-deposits';

import { toValueView } from '@/shared/utils/value-view';

import Image from 'next/image';
import type { ShieldingDepositWithMeta } from '@/shared/api/server/shielding-deposits';

interface DepositItemProps {
  deposit: ShieldingDepositWithMeta;
}

const DepositItem = ({ deposit }: DepositItemProps) => {
  const valueView = deposit.metadata
    ? toValueView({
        amount: Number(deposit.amount),
        metadata: deposit.metadata,
      })
    : null;

  // Get asset icon from metadata images
  const assetImage = deposit.metadata?.images[0];
  const assetIconUrl = assetImage?.png ?? assetImage?.svg;

  return (
    <div className='grid h-[48px] grid-cols-[2.5rem_1fr] grid-rows-2 gap-x-3 gap-y-1 rounded-sm bg-other-tonal-fill10 p-2 whitespace-nowrap backdrop-blur-lg'>
      {/* Asset icon spanning two rows - centered vertically */}
      <div className='row-span-2 flex items-center justify-center'>
        {assetIconUrl ? (
          <Image
            src={assetIconUrl}
            alt={`${deposit.metadata?.symbol ?? 'Asset'} icon`}
            className='h-8 w-8 rounded-full object-cover'
            width={32}
            height={32}
          />
        ) : (
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-neutral-600'>
            <Text detail>{deposit.metadata?.symbol.charAt(0) ?? '?'}</Text>
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
