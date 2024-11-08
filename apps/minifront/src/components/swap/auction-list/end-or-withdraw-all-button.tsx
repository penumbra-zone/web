import { useAuctionInfos } from '../../../state/swap/dutch-auction';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { Button } from '@penumbra-zone/ui-old/components/ui/button';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow.ts';
import { filterWithLimit } from './helpers.ts';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@penumbra-zone/ui-old/components/ui/tooltip';
import { AuctionInfo } from '../../../fetchers/auction-infos.ts';

const endOrWithdrawAllButtonSelector = (state: AllSlices) => ({
  endAllAuctions: state.swap.dutchAuction.endAllAuctions,
  withdrawAllAuctions: state.swap.dutchAuction.withdrawAllAuctions,
});

export interface AuctionsBatch {
  auctions: AuctionInfo[];
  source: AddressIndex;
}

// Assemble batch auctions for end or withdrawal.
// All auctions in the batch will have the same 'AddressIndex'
export const assembleAuctionBatch = (
  auctions: AuctionInfo[],
  filteredSeqNumber: bigint,
  batchLimit: number,
): AuctionsBatch => {
  const filteredBySeqAuctions: AuctionInfo[] = auctions.filter(
    a => a.localSeqNum === filteredSeqNumber,
  );
  // Get the address index of the first auction in the list and filter other auctions with this address index
  const firstFoundAddressIndex = filteredBySeqAuctions[0]?.addressIndex;

  const filteredBySeqAndAddressIndexAuctions = filterWithLimit(
    filteredBySeqAuctions,
    a => a.addressIndex.equals(firstFoundAddressIndex),
    batchLimit,
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: justify
  return { auctions: filteredBySeqAndAddressIndexAuctions, source: firstFoundAddressIndex! };
};

// Chain has a transaction size limit, so we can add at most a batch of 48 auctions in a single transaction
// see https://github.com/penumbra-zone/web/issues/1166#issuecomment-2263550249
// However, due to wasm memory limits, making the max lower until resolved:
// https://github.com/penumbra-zone/web/issues/1702
const BATCH_LIMIT = 24;
const endTooltipContent = `End a batch of open auctions, with a limit of ${BATCH_LIMIT} auctions per transaction`;
const withdrawTooltipContent = `Withdraw a batch of ended auctions, with a limit of ${BATCH_LIMIT} auctions per transaction`;

export const EndOrWithdrawAllButton = () => {
  const { endAllAuctions, withdrawAllAuctions } = useStoreShallow(endOrWithdrawAllButtonSelector);
  const { data } = useAuctionInfos();

  if (!data?.length) {
    return null;
  }
  if (data.some(a => a.localSeqNum === 0n)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            onClick={() => {
              const auctionBatch = assembleAuctionBatch(data, 0n, BATCH_LIMIT);

              void endAllAuctions(
                auctionBatch.auctions,
                // TODO Should use the index of the selected account after the account selector for the auction is implemented
                auctionBatch.source,
              );
            }}
            aria-label={endTooltipContent}
          >
            <div className='w-[120px] shrink-0'>
              <Button size='sm' variant='secondary' className='w-full'>
                End batch
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>{endTooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (data.some(a => a.localSeqNum === 1n)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            onClick={() => {
              const auctionBatch = assembleAuctionBatch(data, 1n, BATCH_LIMIT);
              void withdrawAllAuctions(
                auctionBatch.auctions,
                // TODO Should use the index of the selected account after the account selector for the auction is implemented
                auctionBatch.source,
              );
            }}
            aria-label={withdrawTooltipContent}
          >
            <div className='w-[120px] shrink-0'>
              <Button size='sm' variant='secondary' className='w-full'>
                Withdraw batch
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>{withdrawTooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return null;
};
