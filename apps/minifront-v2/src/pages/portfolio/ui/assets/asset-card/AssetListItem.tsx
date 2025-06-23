import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AssetIcon, Button, Text } from '@penumbra-zone/ui';
import type { AssetData } from './types';
import { ArrowUpFromDot, ArrowRightLeft, MoonStar } from 'lucide-react';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { getDisplay } from '@penumbra-zone/getters/metadata';

export interface AssetListItemProps {
  /**
   * Asset to display
   */
  asset: AssetData;
}

/**
 * AssetListItem component renders an individual asset with its details and action buttons
 */
export const AssetListItem = ({ asset }: AssetListItemProps) => {
  // Use the original metadata if available, otherwise create fallback metadata
  const metadataForIcon =
    asset.originalMetadata ||
    new Metadata({
      symbol: asset.symbol,
      name: asset.name,
      images: asset.icon ? [{ png: asset.icon }] : [],
    });

  // Check if this is a delegation token and format accordingly
  const isDelegationToken =
    asset.originalMetadata?.symbol?.startsWith('delUM(') ||
    asset.originalMetadata?.symbol === 'delUM' ||
    (asset.originalMetadata &&
      assetPatterns.delegationToken.matches(getDisplay.optional(asset.originalMetadata) || ''));

  // Format display for delegation tokens
  let displaySymbol = asset.symbol;
  let displayName = asset.name;

  if (isDelegationToken && asset.originalMetadata) {
    // Show clean "delUM" symbol
    displaySymbol = 'delUM';

    // Extract full validator ID for the name
    let validatorId = '';
    const display = getDisplay.optional(asset.originalMetadata);
    if (display) {
      const delegationMatch = assetPatterns.delegationToken.capture(display);
      if (delegationMatch?.id) {
        // Use full validator ID, let Text component handle truncation
        validatorId = delegationMatch.id;
      }
    }

    // If we couldn't get from display, try from symbol
    if (!validatorId && asset.originalMetadata.symbol?.startsWith('delUM(')) {
      const match = asset.originalMetadata.symbol.match(/delUM\(([^)]+)\)/);
      if (match?.[1]) {
        validatorId = match[1]; // Use full ID from symbol
      }
    }

    displayName = validatorId ? `Delegated Penumbra (${validatorId})` : 'Delegated Penumbra';
  }

  // Action handlers
  const handleSend = () => {
    // console.log('Send', asset.id);
  };

  const handleSwap = () => {
    // console.log('Swap', asset.id);
  };

  const handleMore = () => {
    // console.log('More', asset.id);
  };

  return (
    <div className='group relative flex h-16 items-center justify-between rounded-sm bg-other-tonal-fill5 p-3 hover:bg-[rgba(250,250,250,0.05)] hover:bg-linear-to-b hover:from-[rgba(83,174,168,0.15)] hover:to-[rgba(83,174,168,0.15)]'>
      <div className='flex items-center gap-2 min-w-0 flex-1 pr-32'>
        <AssetIcon size='md' metadata={metadataForIcon} zIndex={undefined} />
        <div className='flex flex-col min-w-0 flex-1'>
          {/* Amount and symbol with body typography */}
          <Text color='text.primary' body>
            {asset.amount} {displaySymbol}
          </Text>
          {/* Asset name with detail typography */}
          <Text color='text.secondary' xs truncate>
            {displayName}
          </Text>
        </div>
      </div>
      <div className='flex items-center gap-3 shrink-0'>
        {/* Value with detail typography */}
        {!isNaN(Number(asset.value)) && (
          <Text color='text.secondary' xs>
            {asset.value}
          </Text>
        )}
      </div>
      {/* Buttons group - absolutely positioned */}
      <div className='absolute right-3 top-4 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
        <Button
          iconOnly
          icon={ArrowUpFromDot}
          density='compact'
          actionType='accent'
          onClick={handleSend}
        >
          Send
        </Button>
        <Button
          iconOnly
          icon={ArrowRightLeft}
          density='compact'
          actionType='accent'
          onClick={handleSwap}
        >
          Swap
        </Button>
        <Button iconOnly icon={MoonStar} actionType='accent' density='compact' onClick={handleMore}>
          More
        </Button>
      </div>
    </div>
  );
};
