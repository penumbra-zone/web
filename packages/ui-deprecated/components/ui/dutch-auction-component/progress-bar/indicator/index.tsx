import { useMemo } from 'react';
import { DutchAuction } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { CircleArrowRight, CircleCheck, CircleX } from 'lucide-react';
import { getDescription } from '@penumbra-zone/getters/dutch-auction';
import { isZero } from '@penumbra-zone/types/amount';
import { getProgress } from './get-progress';

export const Indicator = ({
  dutchAuction,
  fullSyncHeight,
}: {
  dutchAuction: DutchAuction;
  fullSyncHeight?: bigint;
}) => {
  const description = getDescription(dutchAuction);
  const seqNum = dutchAuction.state?.seq;

  const stateIcon = useMemo(() => {
    const auctionEnded =
      (!!seqNum && seqNum > 0n) || (!!fullSyncHeight && fullSyncHeight >= description.endHeight);
    const isFilled =
      !!dutchAuction.state?.inputReserves && isZero(dutchAuction.state.inputReserves);
    const isUnfilled =
      !!dutchAuction.state?.inputReserves && !isZero(dutchAuction.state.inputReserves);

    if (auctionEnded && isUnfilled) {
      return <CircleX size={16} className='text-red' />;
    }

    if (isFilled || auctionEnded) {
      return <CircleCheck size={16} className='text-green' />;
    }

    return <CircleArrowRight size={16} />;
  }, [seqNum, fullSyncHeight, description.endHeight, dutchAuction.state]);

  const progress = getProgress(
    description.startHeight,
    description.endHeight,
    fullSyncHeight,
    seqNum,
  );

  if (seqNum === undefined) {
    return null;
  }

  return (
    <div className='absolute' style={{ left: `max(${progress * 100}% - 16px, 0px)` }}>
      {stateIcon}
    </div>
  );
};
