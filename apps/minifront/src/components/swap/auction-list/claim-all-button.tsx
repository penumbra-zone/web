import { useAuctionInfos } from '../../../state/swap/dutch-auction';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { Button } from '@repo/ui/components/ui/button';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow.ts';
import { filterWithLimit } from './helpers.ts';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/ui/components/ui/tooltip';

const claimAllAuctionButtonSelector = (state: AllSlices) => ({
  endAllAuctions: state.swap.dutchAuction.endAllAuctions,
  withdrawAllAuctions: state.swap.dutchAuction.withdrawAllAuctions,
});

export const ClaimAllAuctionButton = () => {
  const { endAllAuctions, withdrawAllAuctions } = useStoreShallow(claimAllAuctionButtonSelector);
  const { data } = useAuctionInfos();

  if (!data?.length) {
    return null;
  }
  if (data.some(a => a.localSeqNum === 0n)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            onClick={() =>
              void endAllAuctions(
                // Chain has a transaction size limit, so we can add at most a batch of 48 auctions in a single transaction
                // see https://github.com/penumbra-zone/web/issues/1166#issuecomment-2263550249
                filterWithLimit(data, a => a.localSeqNum === 0n, 48),
                // TODO Should use the index of the selected account after the account selector for the auction is implemented
                new AddressIndex({ account: 0 }),
              )
            }
            aria-label='End all open auctions, with a limit of 48 auctions per transaction'
          >
            <div className='w-[85px] shrink-0'>
              <Button size='sm' variant='secondary' className='w-full'>
                {'End all'}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            End all open auctions, with a limit of 48 auctions per transaction
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (data.some(a => a.localSeqNum === 1n)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            onClick={() =>
              void withdrawAllAuctions(
                // Chain has a transaction size limit, so we can add at most a batch of 48 auctions in a single transaction
                // see https://github.com/penumbra-zone/web/issues/1166#issuecomment-2263550249
                filterWithLimit(data, a => a.localSeqNum === 1n, 24),
                // TODO Should use the index of the selected account after the account selector for the auction is implemented
                new AddressIndex({ account: 0 }),
              )
            }
            aria-label='Withdraw all ended auctions, with a limit of 48 auctions per transaction'
          >
            <div className='w-[95px] shrink-0'>
              <Button size='sm' variant='secondary' className='w-full'>
                {'Withdraw all'}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            Withdraw all ended auctions, with a limit of 48 auctions per transaction
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return null;
};
