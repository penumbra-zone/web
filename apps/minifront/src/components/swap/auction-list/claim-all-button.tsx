import { useAuctionInfos } from '../../../state/swap/dutch-auction';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { Button } from '@repo/ui/components/ui/button';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow.ts';

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
      <div className='w-[85px] shrink-0'>
        <Button
          size='sm'
          variant='secondary'
          className='w-full'
          onClick={() =>
            void endAllAuctions(
              data.filter(a => a.localSeqNum === 0n),
              // TODO Must use the index of the selected account after the account selector for the auction is implemented
              new AddressIndex({ account: 0 }),
            )
          }
        >
          {'End all'}
        </Button>
      </div>
    );
  }

  if (data.some(a => a.localSeqNum === 1n)) {
    return (
      <div className='w-[95px] shrink-0'>
        <Button
          size='sm'
          variant='secondary'
          className='w-full'
          onClick={() =>
            void withdrawAllAuctions(
              data.filter(a => a.localSeqNum === 1n),
              // TODO Must use the index of the selected account after the account selector for the auction is implemented
              new AddressIndex({ account: 0 }),
            )
          }
        >
          {'Withdraw all'}
        </Button>
      </div>
    );
  }

  return null;
};
