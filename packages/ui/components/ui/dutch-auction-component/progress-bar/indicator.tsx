import { DutchAuction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { CircleArrowRight, CircleCheck, CircleX } from 'lucide-react';
import { getProgress } from '../get-progress';
import { getDescription } from '@penumbra-zone/getters/dutch-auction';
import { isZero } from '@penumbra-zone/types/amount';

export const Indicator = ({
  dutchAuction,
  fullSyncHeight,
}: {
  dutchAuction: DutchAuction;
  fullSyncHeight?: bigint;
}) => {
  const description = getDescription(dutchAuction);
  const seqNum = dutchAuction.state?.seq;
  if (seqNum === undefined) return null;

  const auctionEnded =
    (!!seqNum && seqNum > 0n) || (!!fullSyncHeight && fullSyncHeight >= description.endHeight);
  const endedUnfulfilled =
    auctionEnded &&
    !!dutchAuction.state?.inputReserves &&
    !isZero(dutchAuction.state.inputReserves);

  const progress = getProgress(
    description.startHeight,
    description.endHeight,
    fullSyncHeight,
    seqNum,
  );

  return (
    <div className='absolute' style={{ left: `max(${progress * 100}% - 16px, 0px)` }}>
      {endedUnfulfilled ? (
        <CircleX size={16} className='text-red' />
      ) : auctionEnded ? (
        <CircleCheck size={16} className='text-green' />
      ) : (
        <CircleArrowRight size={16} />
      )}
    </div>
  );
};
