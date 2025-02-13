import { CopyToClipboardIconButton } from './copy-to-clipboard/copy-to-clipboard-icon-button';
import { useMemo } from 'react';
import { AuctionId } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { bech32mAuctionId, PENUMBRA_BECH32M_AUCTION_PREFIX } from '@penumbra-zone/bech32m/pauctid';

const SEPARATOR_INDEX = PENUMBRA_BECH32M_AUCTION_PREFIX.length + 1;

/**
 * Renders an auction's `AuctionId` as a bech32-encoded string, along with a
 * copy button.
 *
 * @example
 * ```tsx
 * <AuctionIdComponent auctionId={auctionId} />
 * ```
 */
export const AuctionIdComponent = ({ auctionId }: { auctionId?: AuctionId }) => {
  const id = useMemo(() => (auctionId ? bech32mAuctionId(auctionId) : undefined), [auctionId]);

  if (!id) {
    return null;
  }

  return (
    <div className='flex min-w-0 items-center gap-2'>
      <div className='min-w-0 truncate font-mono'>
        <span className='text-muted-foreground'>{id.slice(0, SEPARATOR_INDEX)}</span>
        {id.slice(SEPARATOR_INDEX)}
      </div>
      <CopyToClipboardIconButton text={id} />
    </div>
  );
};
