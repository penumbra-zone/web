import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AssetIcon } from '@penumbra-zone/ui';
import { AssetMock } from './mock';
import { Button } from '@penumbra-zone/ui';
import { ArrowUpFromDot, ArrowRightLeft, MoonStar } from 'lucide-react';
import { Text } from '@penumbra-zone/ui';

export interface AssetListItemProps {
  /**
   * Asset to display
   */
  asset: AssetMock;
}

/**
 * AssetListItem component renders an individual asset with its details and action buttons
 */
export const AssetListItem = ({ asset }: AssetListItemProps) => {
  // Create a mock metadata for the asset icon
  const mockMetadata = new Metadata({
    symbol: asset.symbol,
    // Use provided icon or leave empty for default identicon
    images: asset.icon ? [{ png: asset.icon }] : [],
  });

  // Action handlers
  const handleSend = () => {
    console.log('Send', asset.id);
  };
  
  const handleSwap = () => {
    console.log('Swap', asset.id);
  };
  
  const handleMore = () => {
    console.log('More', asset.id);
  };

  return (
    <div className="relative flex items-center justify-between p-3 h-16 rounded-sm bg-other-tonalFill5 hover:bg-gradient-to-b hover:from-[rgba(83,174,168,0.15)] hover:to-[rgba(83,174,168,0.15)] hover:bg-[rgba(250,250,250,0.05)] group">
      <div className="flex items-center gap-2">
        <AssetIcon size="md" metadata={mockMetadata} />
        <div className="flex flex-col">
          {/* Amount and symbol with body typography */}
          <Text color="text.primary" body>
            {asset.amount} {asset.symbol}
          </Text>
          {/* Asset name with detail typography */}
          <Text color="text.secondary" xs truncate>
            {asset.name}
          </Text>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Value with detail typography */}
        {!isNaN(Number(asset.value)) && (
          <Text color="text.secondary" xs>
            {asset.value}
          </Text>
        )}
      </div>
      {/* Buttons group - absolutely positioned */}
      <div className="absolute right-3 top-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button 
          iconOnly
          icon={ArrowUpFromDot}
          density="compact"
          actionType="accent"
          onClick={handleSend}
        >
          Send
        </Button>
        <Button 
          iconOnly
          icon={ArrowRightLeft}
          density="compact"
          actionType="accent"
          onClick={handleSwap}
        >
          Swap
        </Button>
        <Button 
          iconOnly
          icon={MoonStar}
          actionType="accent"
          density="compact"
          onClick={handleMore}
        >
          More
        </Button>
      </div>
    </div>
  );
}; 