'use client';

import { useState } from 'react';
import { Card } from '@penumbra-zone/ui/Card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { useShieldingDeposits } from '@/shared/api/use-shielding-deposits';
import { useRegistry } from '@/shared/api/registry';
import { toValueView } from '@/shared/utils/value-view';
import { Chain, Registry } from '@penumbra-labs/registry';
import { bech32, bech32m } from 'bech32';
import cn from 'clsx';
import Image from 'next/image';

const getChainFromForeignAddress = (
  foreignAddr: string,
  registry: Registry | undefined,
): Chain | null => {
  if (!registry) {
    return null;
  }

  // Decode the bech32/bech32m address to get the prefix
  const decoded =
    bech32.decodeUnsafe(foreignAddr, Infinity) ?? bech32m.decodeUnsafe(foreignAddr, Infinity);
  if (!decoded?.prefix) {
    return null;
  }

  // Find the chain that matches this address prefix
  const chain = registry.ibcConnections.find(c => c.addressPrefix === decoded.prefix);
  return chain ?? null;
};

export const ShieldingTicker = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { data: deposits, isLoading } = useShieldingDeposits(100);
  const { data: registry } = useRegistry();

  // Prepare deposit items upfront
  const depositItems = deposits?.map(deposit => {
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
        key={deposit.id}
        className='flex items-center gap-3 rounded-lg border border-gray-700/50 bg-gray-800/30 p-3 transition-colors hover:bg-gray-800/50'
      >
        <div className='flex-shrink-0'>
          {chainIconUrl ? (
            <Image
              src={chainIconUrl}
              alt={`${chain?.displayName} chain`}
              className='h-[24px] w-[24px] rounded-full'
              width={24}
              height={24}
            />
          ) : (
            <div className='flex h-[24px] w-[24px] items-center justify-center rounded-full bg-gray-600'>
              <Text detail>?</Text>
            </div>
          )}
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <Text small color='text.primary'>
              Deposit
            </Text>
            {valueView ? (
              <ValueViewComponent
                density='compact'
                valueView={valueView}
                priority='primary'
                abbreviate={false}
              />
            ) : (
              <Text small color='text.secondary'>
                {deposit.amount} {deposit.metadata?.display ?? 'Unknown'}
              </Text>
            )}
          </div>
          <Text detail color='text.secondary' truncate>
            from {deposit.foreignAddr.substring(0, 15)}...
          </Text>
        </div>

        <div className='flex-shrink-0 text-right'>
          <Text detail color='text.secondary'>
            #{deposit.height}
          </Text>
        </div>
      </div>
    );
  });

  // Prepare loading skeleton items
  const loadingItems = Array.from({ length: 3 }).map((_, i) => (
    <div key={i} className='flex animate-pulse items-center gap-3 rounded-lg bg-gray-800/30 p-3'>
      <div className='h-8 w-8 rounded-full bg-gray-600'></div>
      <div className='flex-1 space-y-2'>
        <div className='h-4 w-3/4 rounded bg-gray-600'></div>
        <div className='h-3 w-1/2 rounded bg-gray-700'></div>
      </div>
    </div>
  ));

  const hasDeposits = deposits && deposits.length > 0;

  return (
    <div className={cn('fixed bottom-4 left-4 z-50', collapsed && 'pointer-events-none')}>
      <Card>
        <div className='relative overflow-hidden'>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className='absolute top-2 right-2 z-10 rounded p-1 transition-colors hover:bg-white/10'
          >
            {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {!collapsed && (
            <div className='p-4'>
              <div className='mb-3 flex items-center gap-2'>
                <div className='h-2 w-2 animate-pulse rounded-full bg-green-400'></div>
                <Text as='h4' large color='text.primary'>
                  Live Shielding Activity
                </Text>
              </div>

              <div className='max-h-60 space-y-3 overflow-y-auto'>
                {isLoading && <div className='space-y-3'>{loadingItems}</div>}

                {!isLoading && hasDeposits && depositItems}

                {!isLoading && !hasDeposits && (
                  <div className='py-8 text-center'>
                    <Text small color='text.secondary'>
                      No recent shielding activity
                    </Text>
                  </div>
                )}
              </div>
            </div>
          )}

          {collapsed && (
            <div className='p-3 text-center'>
              <div className='flex items-center justify-center gap-2'>
                <div className='h-2 w-2 animate-pulse rounded-full bg-green-400'></div>
                <Text small>🛡️ Shielding Activity</Text>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
