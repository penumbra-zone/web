'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Button } from '@penumbra-zone/ui/Button';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { useShieldingDeposits } from '@/shared/api/use-shielding-deposits';
import { useRegistry } from '@/shared/api/registry';
import { Chain, Registry } from '@penumbra-labs/registry';
import { toValueView } from '@/shared/utils/value-view';
import Marquee from 'react-fast-marquee';
import { useRouter, useSearchParams } from 'next/navigation';

import Image from 'next/image';
import type { ShieldingDepositWithMeta } from '@/shared/api/server/shielding-deposits';
import { getPortfolioPath, QueryParams } from '@/shared/const/pages';
import { useAutoAnimate } from '@formkit/auto-animate/react';

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

  const chainFromAddress = registry.ibcConnections.find(
    (chain: Chain) => chain.addressPrefix === addressPrefix,
  );

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

  // Construct the Noctis URL - use transaction hash if available, otherwise fallback to block
  const noctisUrl = deposit.txHash
    ? `https://explorer.penumbra.zone/tx/${deposit.txHash}`
    : `https://explorer.penumbra.zone/block/${deposit.height}`;

  return (
    <a
      href={noctisUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='mx-3 grid h-[48px] cursor-pointer grid-cols-[2.5rem_1fr_auto] grid-rows-2 gap-x-3 gap-y-1 rounded-sm bg-other-tonal-fill10 p-2 whitespace-nowrap backdrop-blur-lg transition-colors hover:bg-other-tonal-fill5'
    >
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

      {/* First row: Empty space for external link alignment */}
      <div></div>

      {/* Second row: Address */}
      <Text detail color='text.secondary'>
        {deposit.foreignAddr.length > 20
          ? `${deposit.foreignAddr.substring(0, 8)}...${deposit.foreignAddr.slice(-6)}`
          : deposit.foreignAddr}
      </Text>

      {/* Second row: External link icon */}
      <div className='flex items-center justify-center opacity-60'>
        <ExternalLink className='h-3 w-3' />
      </div>
    </a>
  );
};

export const ShieldingTicker = () => {
  const [parent] = useAutoAnimate();
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const showShieldingTicker = searchParams?.get(QueryParams.PortfolioShowShieldingTicker);

  const { data: deposits, isLoading } = useShieldingDeposits(50);

  const hasDeposits = deposits && deposits.length > 0;

  useEffect(() => {
    if (showShieldingTicker === 'true') {
      setIsVisible(true);
    }
    if (showShieldingTicker === 'false') {
      setIsVisible(false);
    }
  }, [showShieldingTicker]);

  if (!isVisible) {
    return null;
  }

  if (isLoading || !hasDeposits) {
    return (
      <div className='w-full'>
        <div className='container mx-auto flex max-w-[1136px] items-center justify-between px-4 py-3'>
          <div className='flex items-center gap-2'>
            <div className='h-2 w-2 animate-pulse rounded-full bg-green-400'></div>
            <Text small color='text.secondary'>
              {isLoading ? 'Loading shielding activity...' : 'No recent shielding activity'}
            </Text>
          </div>
          <Button
            density='compact'
            iconOnly
            icon={X}
            onClick={() => {
              router.push(getPortfolioPath({ showShieldingTicker: false }));
            }}
          >
            Dismiss
          </Button>
        </div>

        <div className='relative h-18 w-full py-3' />
      </div>
    );
  }

  return (
    <div className='w-full'>
      {/* Title and hide button row - constrained to container width */}
      <div className='container mx-auto flex max-w-[1136px] items-center justify-between px-4 py-3'>
        <div className='flex items-center gap-2'>
          <div className='h-2 w-2 animate-pulse rounded-full bg-green-400'></div>
          <Text small color='text.primary'>
            Live Shielding Activity
          </Text>
        </div>
        <Button
          density='compact'
          iconOnly
          icon={X}
          onClick={() => {
            router.push(getPortfolioPath({ showShieldingTicker: false }));
          }}
        >
          Dismiss
        </Button>
      </div>

      {/* Full-width marquee area */}
      <div ref={parent} className='relative h-18 w-full py-3'>
        <Marquee pauseOnHover={true} speed={30} gradient={false} autoFill={true}>
          {deposits.map(deposit => (
            <DepositItem key={deposit.id} deposit={deposit} />
          ))}
        </Marquee>
      </div>
    </div>
  );
};
